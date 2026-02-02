using Api.Datastore;
using Api.Models.Dnd;
using Api.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.RegularExpressions;
using Api.Services.Users;
using Microsoft.Extensions.Caching.Memory;

namespace Api.Controllers.Dnd;

[Route("api/v1/[controller]")]
[ApiController]
[Authorize]
public class CampaignController(DatabaseContext dbContext, UserInfoService userInfoService) : ControllerBase
{
    // --- Campaign Endpoints ---
    /// <summary>
    /// Creates a new campaign with the provided information.
    /// </summary>
    /// <param name="model"></param>
    /// <returns></returns>
    public async Task<IActionResult> CreateCampaign([FromBody] CampaignModel model)
    {
        // Hydrate the service with the current user's claims
        if (!userInfoService.SetId(User)) return Unauthorized();
        var userId = userInfoService.GetId();

        // CRITICAL: Detach the DungeonMaster object sent by the frontend JSON.
        // This satisfies the "Required" validator but prevents the tracking conflict.
        model.DungeonMaster = null; 
        
        // Set the DM to the current user
        model.DungeonMasterId = userId; 

        // Fetch the existing user from the DB context.
        // This instance is now the "Source of Truth" for the tracker.
        var user = await dbContext.Users.FindAsync(userId);
    
        // Add the current user to the enrolled users list
        if (user != null) 
        {
            // Initialize the list if it's null, then add the tracked user.
            model.EnrolledUsers ??= new List<UserInfoModel>();
            model.EnrolledUsers.Add(user);
        }

        // Add the campaign to the database
        dbContext.Campaigns.Add(model);
        await dbContext.SaveChangesAsync();

        // Return the created campaign details
        return CreatedAtAction(nameof(GetCampaignDetails), new { id = model.Id }, new { 
            id = model.Id, 
            name = model.Name,
            message = "Campaign created successfully!" 
        });
    }
    
    // Returns all campaigns the logged-in user is part of
    /// <summary>
    /// Retrieves all campaigns associated with the currently authenticated user.
    /// </summary>
    /// <returns></returns>
    [HttpGet("mine")]
    public async Task<IActionResult> GetMyCampaigns()
    {
        // Hydrate the service with the current user's claims
        if (!userInfoService.SetId(User)) return Unauthorized("Could not identify user from token.");

        var userId = userInfoService.GetId();

        var campaigns = await dbContext.Campaigns
            .Where(c => c.EnrolledUsers.Any(u => u.Id == userId))
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Theme,
                c.Summary,
                c.DungeonMasterId
            })
            .ToListAsync();

        // Set dungeon master info for all campaigns
        var dmIds = campaigns
            .Select(c => c.DungeonMasterId)
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();

        var dungeonMasterInfo = await dbContext.Users
            .Where(u => dmIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => new { u.Id, u.Username });

        var resultCampaigns = campaigns.Select(c =>
        {
            var hasDm = dungeonMasterInfo.TryGetValue(c.DungeonMasterId, out var dm);
            return new
            {
                c.Id,
                c.Name,
                c.Theme,
                c.Summary,
                Dungeonmaster = hasDm
                    ? new { dm.Id, dm.Username }
                    : new { Id = Guid.Empty, Username = "Unknown DM" }
            };
        }).ToList();

        return Ok(new
        {
            UserId = userId,
            Campaigns = resultCampaigns
        });
    }

    /// <summary>
    /// Retrieves detailed information about a specific campaign identified by the 'id' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCampaignDetails(Guid id)
    {
        var campaign = await dbContext.Campaigns
            .Include(c => c.Quotes)
            .Include(c => c.Party)
            .Include(c => c.Quests)
            .Include(c => c.LoreEntries)
            .Include(c => c.EnrolledUsers)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (campaign == null) return NotFound("Campaign not found.");

        // Set campaign quotes ordered by CreatedAt descending
        campaign.Quotes = await dbContext.Quotes
            .Where(q => q.CampaignId == campaign.Id)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();

        // Set lore entries ordered by CreatedAt descending
        campaign.LoreEntries = await dbContext.LoreEntries
            .Where(l => l.CampaignId == campaign.Id)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        // Set party members ordered by Name ascending
        campaign.Party = await dbContext.Characters
            .Where(ch => ch.CampaignId == campaign.Id)
            .OrderBy(ch => ch.Name)
            .ToListAsync();

        // Set quests ordered by CreatedAt descending
        campaign.Quests = await dbContext.Quests
            .Where(q => q.CampaignId == campaign.Id)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();

        // Set dungeon master info
        campaign.DungeonMaster = (await dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == campaign.DungeonMasterId)) ?? new UserInfoModel
        {
            Id = Guid.Empty,
            Username = "Unknown DM",
        };

        return Ok(new
        {
            GeneralInfo = new
            {
                campaign.Id,
                campaign.Name,
                campaign.Theme,
                campaign.Summary
            },
            Quotes = new
            {
                TotalQuotes = campaign.Quotes.Count,
                Recent = campaign.Quotes.Take(5).ToList(),
                All = campaign.Quotes
            },
            LoreEntries = new
            {
                TotalLoreEntries = campaign.LoreEntries.Count,
                Active = campaign.LoreEntries.Where(l => l.Status.ToLower() == "active").ToList(),
                Archived = campaign.LoreEntries.Where(l => l.Status.ToLower() == "archived").ToList()
            },
            Party = new
            {
                TotalPartyMembers = campaign.Party.Count,
                campaign.Party
            },
            Quests = new
            {
                TotalQuests = campaign.Quests.Count,
                Active = campaign.Quests.Where(q => q.Status.ToLower() == "active").ToList(),
                Completed = campaign.Quests.Where(q => q.Status.ToLower() == "completed").ToList(),
                Failed = campaign.Quests.Where(q => q.Status.ToLower() == "failed").ToList()
            },
            EnrolledUsers = campaign.EnrolledUsers?
                .Select(u => new { u.Id, u.Username, u.Email })
                .ToList(),
            TotalEnrolledUsers = campaign.EnrolledUsers?.Count ?? 0,
            Dungeonmaster = new { campaign.DungeonMaster.Id, campaign.DungeonMaster.Username }
        });
    }

    /// <summary>
    /// Update campaign details with the provided information.
    /// The target campaign is identified by the 'id' parameter.
    /// </summary>
    /// <returns></returns>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCampaign(Guid id, [FromBody] CampaignModel updatedCampaign)
    {
        // Find the campaign to update
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Update fields
        campaign.Name = updatedCampaign.Name;
        campaign.Theme = updatedCampaign.Theme;
        campaign.Summary = updatedCampaign.Summary;

        // Update DungeonMasterId if provided
        if (updatedCampaign.DungeonMasterId != Guid.Empty)
        {
            campaign.DungeonMasterId = updatedCampaign.DungeonMasterId;
        }

        // Save changes to the database
        dbContext.Campaigns.Update(campaign);
        await dbContext.SaveChangesAsync();

        // Return the updated campaign
        return Ok(campaign);
    }

    /// <summary>
    /// Deletes the campaign identified by the 'id' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCampaign(Guid id)
    {
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        dbContext.Campaigns.Remove(campaign);
        await dbContext.SaveChangesAsync();
        return NoContent();
    }

    // --- Quote Endpoints ---

    /// <summary>
    /// Adds a new quote to the specified campaign identified by the 'id' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="model"></param>
    /// <returns></returns>
    [HttpPost("{id}/quote")]
    public async Task<IActionResult> AddQuote(Guid id, [FromBody] QuoteModel model)
    {
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound();

        model.CampaignId = id;
        dbContext.Quotes.Add(model);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCampaignDetails), new { id = campaign.Id }, model);
    }

    /// <summary>
    /// Retrieves a specific quote from the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the specific quote to
    /// </summary>
    /// <param name="id"></param>
    /// <param name="quoteId"></param>
    /// <returns></returns>
    [HttpGet("{id}/quote/{quoteId}")]
    public async Task<IActionResult> GetSpecificQuote(Guid id, Guid quoteId)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Find the specific quote
        var quote = await dbContext.Quotes.FindAsync(quoteId);
        if (quote == null || quote.CampaignId != id) return NotFound("Quote not found in the specified campaign.");

        // Return the quote
        return Ok(quote);
    }

    /// <summary>
    /// Retrieves all quotes associated with the specified campaign identified by the 'id' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpGet("{id}/quotes")]
    public async Task<IActionResult> GetAllQuotes(Guid id)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Retrieve all quotes for the campaign
        var quotes = await dbContext.Quotes
            .Where(q => q.CampaignId == id)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();

        // Return the list of quotes
        return Ok(quotes);
    }

    /// <summary>
    /// Updates an existing quote within the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the specific quote to update is identified by the 'quoteId' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="quoteId"></param>
    /// <param name="updatedQuote"></param>
    /// <returns></returns>
    [HttpPut("{id}/quote/{quoteId}")]
    public async Task<IActionResult> UpdateQuote(Guid id, Guid quoteId, [FromBody] QuoteModel updatedQuote)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Find the quote to update
        var quote = await dbContext.Quotes.FindAsync(quoteId);
        if (quote == null || quote.CampaignId != id) return NotFound("Quote not found in the specified campaign.");

        // Update quote content
        quote.Author = updatedQuote.Author;
        quote.Text = updatedQuote.Text;

        // Update timestamp
        quote.UpdatedAt = DateTime.UtcNow;

        // Save changes to the database
        dbContext.Quotes.Update(quote);
        await dbContext.SaveChangesAsync();
        return Ok(quote);
    }

    /// <summary>
    /// Deletes a quote from the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the specific quote to delete is identified by the 'quoteId' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="quoteId"></param>
    /// <returns></returns>
    [HttpDelete("{id}/quote/{quoteId}")]
    public async Task<IActionResult> DeleteQuote(Guid id, Guid quoteId)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Find the quote to delete
        var quote = await dbContext.Quotes.FindAsync(quoteId);
        if (quote == null || quote.CampaignId != id) return NotFound("Quote not found in the specified campaign.");

        // Remove the quote from the database
        dbContext.Quotes.Remove(quote);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    // --- Character Endpoints ---

    /// <summary>
    /// Adds a new character to the specified campaign identified by the 'id' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="model"></param>
    /// <returns></returns>
    [HttpPost("{id}/character")]
    public async Task<IActionResult> AddCharacter(Guid id, [FromBody] CharacterModel model)
    {
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound();

        model.CampaignId = id;
        dbContext.Characters.Add(model);
        await dbContext.SaveChangesAsync();

        return Ok(model);
    }

    /// <summary>
    /// Retrieves a character from the specified campaign by the owner's user ID.
    /// The target campaign is identified by the 'id' parameter, and the character's owner is identified by the 'ownerId' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="ownerId"></param>
    /// <returns></returns>
    [HttpGet("{id}/character/{ownerId}")]
    public async Task<IActionResult> GetCharacterByOwner(Guid id, Guid ownerId)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Find the character by owner ID within the specified campaign
        var character = await dbContext.Characters
            .FirstOrDefaultAsync(c => c.CampaignId == id && c.OwnerId == ownerId);
        if (character == null) return NotFound("Character not found in the specified campaign.");

        // Return the character
        return Ok(character);
    }

    /// <summary>
    /// Retrieves all characters associated with the specified campaign identified by the 'id' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpGet("{id}/characters")]
    public async Task<IActionResult> GetAllCharacters(Guid id)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Retrieve all characters for the campaign
        var characters = await dbContext.Characters
            .Where(c => c.CampaignId == id)
            .OrderBy(c => c.Name)
            .ToListAsync();

        // Return the list of characters
        return Ok(characters);
    }

    /// <summary>
    /// Updates an existing character within the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the specific character to update is identified by the 'characterId' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="characterId"></param>
    /// <param name="updatedCharacter"></param>
    /// <returns></returns>
    [HttpPut("{id}/character/{characterId}")]
    public async Task<IActionResult> UpdateCharacter(Guid id, Guid characterId,
        [FromBody] CharacterModel updatedCharacter)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Find the character to update
        var character = await dbContext.Characters.FindAsync(characterId);
        if (character == null || character.CampaignId != id)
            return NotFound("Character not found in the specified campaign.");

        // Update character fields if provided, otherwise keep existing values
        character.Name = !string.IsNullOrWhiteSpace(updatedCharacter.Name) ? updatedCharacter.Name : character.Name;
        character.Class = !string.IsNullOrWhiteSpace(updatedCharacter.Class) ? updatedCharacter.Class : character.Class;
        character.Level = updatedCharacter.Level > 0 ? updatedCharacter.Level : character.Level;
        character.DndBeyondUrl = !string.IsNullOrWhiteSpace(updatedCharacter.DndBeyondUrl)
            ? updatedCharacter.DndBeyondUrl
            : character.DndBeyondUrl;
        character.CampaignId = updatedCharacter.CampaignId != Guid.Empty ? updatedCharacter.CampaignId : id;
        character.OwnerId = updatedCharacter.OwnerId != Guid.Empty ? updatedCharacter.OwnerId : character.OwnerId;

        // Update timestamp
        character.UpdatedAt = DateTime.UtcNow;

        // Save changes to the database
        dbContext.Characters.Update(character);
        await dbContext.SaveChangesAsync();

        // Return the updated character
        return Ok(character);
    }

    /// <summary>
    /// Deletes a character from the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the specific character to delete is identified by the 'characterId' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="characterId"></param>
    /// <returns></returns>
    [HttpDelete("{id}/character/{characterId}")]
    public async Task<IActionResult> DeleteCharacter(Guid id, Guid characterId)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Find the character to delete
        var character = await dbContext.Characters.FindAsync(characterId);
        if (character == null || character.CampaignId != id)
            return NotFound("Character not found in the specified campaign.");

        // Remove the character from the database
        dbContext.Characters.Remove(character);
        await dbContext.SaveChangesAsync();

        // Return no content
        return NoContent();
    }

    // --- Lore Endpoints ---

    /// <summary>
    /// Adds a new lore entry to the specified campaign identified by the 'id' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="model"></param>
    /// <returns></returns>
    [HttpPost("{id}/lore")]
    public async Task<IActionResult> AddLoreEntry(Guid id, [FromBody] LoreEntryModel model)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound();

        // Assign the campaign ID to the lore entry
        model.CampaignId = id;

        // Add the lore entry to the database
        dbContext.LoreEntries.Add(model);
        await dbContext.SaveChangesAsync();

        // Return the created lore entry
        return Ok(model);
    }

    /// <summary>
    /// Retrieves a specific lore entry from the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the specific lore entry to
    /// is identified by the 'loreId' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="loreId"></param>
    /// <returns></returns>
    [HttpGet("{id}/lore/{loreId}")]
    public async Task<IActionResult> GetLoreEntry(Guid id, Guid loreId)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Find the specific lore entry
        var loreEntry = await dbContext.LoreEntries.FindAsync(loreId);
        if (loreEntry == null || loreEntry.CampaignId != id)
            return NotFound("Lore entry not found in the specified campaign.");

        // Return the lore entry
        return Ok(loreEntry);
    }

    /// <summary>
    /// Retrieves all lore entries associated with the specified campaign identified by the 'id' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpGet("{id}/lore")]
    public async Task<IActionResult> GetAllLoreEntries(Guid id)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Retrieve all lore entries for the campaign
        var loreEntries = await dbContext.LoreEntries
            .Where(l => l.CampaignId == id)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        // Return the list of lore entries
        return Ok(loreEntries);
    }

    /// <summary>
    /// Updates an existing lore entry within the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the specific lore entry to update is identified by the 'loreId' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="loreId"></param>
    /// <param name="updatedLoreEntry"></param>
    /// <returns></returns>
    [HttpPut("{id}/lore/{loreId}")]
    public async Task<IActionResult> UpdateLoreEntry(Guid id, Guid loreId, [FromBody] LoreEntryModel updatedLoreEntry)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Find the lore entry to update
        var loreEntry = await dbContext.LoreEntries.FindAsync(loreId);
        if (loreEntry == null || loreEntry.CampaignId != id)
            return NotFound("Lore entry not found in the specified campaign.");

        // Update lore entry fields
        loreEntry.Title = updatedLoreEntry.Title;
        loreEntry.Content = updatedLoreEntry.Content;
        loreEntry.Status = updatedLoreEntry.Status;

        // Update timestamp
        loreEntry.UpdatedAt = DateTime.UtcNow;

        // Save changes to the database
        dbContext.LoreEntries.Update(loreEntry);
        await dbContext.SaveChangesAsync();

        // Return the updated lore entry
        return Ok(loreEntry);
    }

    /// <summary>
    /// Deletes a lore entry from the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the specific lore entry to delete is identified by the 'loreId' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="loreId"></param>
    /// <returns></returns>
    [HttpDelete("{id}/lore/{loreId}")]
    public async Task<IActionResult> DeleteLoreEntry(Guid id, Guid loreId)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Find the lore entry to delete
        var loreEntry = await dbContext.LoreEntries.FindAsync(loreId);
        if (loreEntry == null || loreEntry.CampaignId != id)
            return NotFound("Lore entry not found in the specified campaign.");

        // Remove the lore entry from the database
        dbContext.LoreEntries.Remove(loreEntry);
        await dbContext.SaveChangesAsync();

        // Return no content
        return NoContent();
    }

    // --- Quest Endpoints ---

    /// <summary>
    /// Adds a new quest to the specified campaign identified by the 'id' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="model"></param>
    /// <returns></returns>
    [HttpPost("{id}/quest")]
    public async Task<IActionResult> AddQuest(Guid id, [FromBody] QuestModel model)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound();

        // Assign the campaign ID to the quest
        model.CampaignId = id;
        dbContext.Quests.Add(model);

        // Save changes to the database
        await dbContext.SaveChangesAsync();

        // Return the created quest
        return Ok(model);
    }

    /// <summary>
    /// Retrieves a specific quest from the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the specific quest to
    /// is identified by the 'questId' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="questId"></param>
    /// <returns></returns>
    [HttpGet("{id}/quest/{questId}")]
    public async Task<IActionResult> GetQuest(Guid id, Guid questId)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Find the specific quest
        var quest = await dbContext.Quests.FindAsync(questId);
        if (quest == null || quest.CampaignId != id) return NotFound("Quest not found in the specified campaign.");

        // Return the quest
        return Ok(quest);
    }

    /// <summary>
    /// Retrieves all quests associated with the specified campaign identified by the 'id' parameter.
    /// The quests are categorized into active, completed, and failed. All quests are also returned.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpGet("{id}/quests")]
    public async Task<IActionResult> GetAllQuests(Guid id)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Retrieve all quests for the campaign
        var quests = await dbContext.Quests
            .Where(q => q.CampaignId == id)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();

        // Filter quests into categories
        var activeQuests = quests.Where(q => q.Status.ToLower() == "active").ToList();
        var completedQuests = quests.Where(q => q.Status.ToLower() == "completed").ToList();
        var failedQuests = quests.Where(q => q.Status.ToLower() == "failed").ToList();

        // Return the list of quests
        return Ok(new
        {
            AllQuests = quests,
            ActiveQuests = activeQuests,
            CompletedQuests = completedQuests,
            FailedQuests = failedQuests
        });
    }

    /// <summary>
    /// Updates an existing quest within the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the specific quest to update is identified by the 'questId' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="questId"></param>
    /// <param name="updatedQuest"></param>
    /// <returns></returns>
    [HttpPut("{id}/quest/{questId}")]
    public async Task<IActionResult> UpdateQuest(Guid id, Guid questId, [FromBody] QuestModel updatedQuest)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Find the quest to update
        var quest = await dbContext.Quests.FindAsync(questId);
        if (quest == null || quest.CampaignId != id) return NotFound("Quest not found in the specified campaign.");

        // Update quest fields
        quest.Title = updatedQuest.Title;
        quest.Description = updatedQuest.Description;
        quest.Status = updatedQuest.Status;

        // Update timestamp
        quest.UpdatedAt = DateTime.UtcNow;

        // Save changes to the database
        dbContext.Quests.Update(quest);
        await dbContext.SaveChangesAsync();

        // Return the updated quest
        return Ok(quest);
    }

    /// <summary>
    /// Deletes a quest from the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the specific quest to delete is identified by the 'questId' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="questId"></param>
    /// <returns></returns>
    [HttpDelete("{id}/quest/{questId}")]
    public async Task<IActionResult> DeleteQuest(Guid id, Guid questId)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Find the quest to delete
        var quest = await dbContext.Quests.FindAsync(questId);
        if (quest == null || quest.CampaignId != id) return NotFound("Quest not found in the specified campaign.");

        // Remove the quest from the database
        dbContext.Quests.Remove(quest);
        await dbContext.SaveChangesAsync();

        // Return no content
        return NoContent();
    }

    // --- Player Endpoints ---

    /// <summary>
    /// Enrolls a user in the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the user to enroll is identified by the 'userId' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="userId"></param>
    /// <returns></returns>
    [HttpPost("{id}/enroll/{userId}")]
    public async Task<IActionResult> EnrollUserInCampaign(Guid id, Guid userId)
    {
        // Find the campaign
        var campaign = await dbContext.Campaigns
            .Include(c => c.EnrolledUsers)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Find the user
        var user = await dbContext.Users.FindAsync(userId);
        if (user == null) return NotFound("User not found.");

        // Check if the user is already enrolled in the campaign
        if (campaign.EnrolledUsers.Any(u => u.Id == userId))
            return BadRequest("User is already enrolled in the campaign.");

        // Enroll the user in the campaign
        campaign.EnrolledUsers.Add(user);
        await dbContext.SaveChangesAsync();

        // Return success response
        return Ok("User enrolled successfully.");
    }


    /// <summary>
    /// Searches for a user by email address.
    /// This endpoint is used when enrolling players in a campaign.
    /// </summary>
    /// <param name="id">Campaign ID</param>
    /// <param name="email">Email address to search for</param>
    /// <returns></returns>
    [HttpGet("{id}/search-user")]
    public async Task<IActionResult> SearchUserByEmail(Guid id, [FromQuery] string email)
    {
        // Check if campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        if (string.IsNullOrWhiteSpace(email))
            return BadRequest("Email parameter is required.");

        // Search for user by email
        var user = await dbContext.Users
            .Where(u => u.Email.ToLower() == email.ToLower())
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email
            })
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound("User not found with that email address.");

        return Ok(user);
    }

    /// <summary>
    /// Unenrolls a user from the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the user to unenroll is identified by the 'userId' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="userId"></param>
    /// <returns></returns>
    [HttpDelete("{id}/unenroll/{userId}")]
    public async Task<IActionResult> UnenrollUserFromCampaign(Guid id, Guid userId)
    {
        // Find the campaign
        var campaign = await dbContext.Campaigns
            .Include(c => c.EnrolledUsers)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (campaign == null) return NotFound("Campaign not found.");

        // Find the user
        var user = await dbContext.Users.FindAsync(userId);
        if (user == null) return NotFound("User not found.");

        // Check if the user is enrolled in the campaign
        if (!campaign.EnrolledUsers.Any(u => u.Id == userId))
            return BadRequest("User is not enrolled in the campaign.");

        // Remove the user from the campaign
        campaign.EnrolledUsers.Remove(user);
        await dbContext.SaveChangesAsync();

        // Return success response
        return Ok("User unenrolled successfully.");
    }

    // --- Map Endpoints ---

    /// <summary>
    /// Adds a new map to the specified campaign identified by the 'id' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="model"></param>
    /// <returns></returns>
    [HttpPost("{id}/map")]
    public async Task<IActionResult> AddMap(Guid id, [FromBody] MapModel model)
    {
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound();

        model.CampaignId = id;
        dbContext.Maps.Add(model);
        await dbContext.SaveChangesAsync();

        return Ok(model);
    }

    /// <summary>
    /// Retrieves all maps associated with the specified campaign identified by the 'id' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpGet("{id}/maps")]
    public async Task<IActionResult> GetCampaignMaps(Guid id)
    {
        var maps = await dbContext.Maps
            .Where(m => m.CampaignId == id)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
        return Ok(maps);
    }

    /// <summary>
    /// Updates an existing map within the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the specific map to update is identified by the 'mapId' parameter.
    /// </summary>
    [HttpPut("{id}/map/{mapId}")]
    public async Task<IActionResult> UpdateMap(Guid id, Guid mapId, [FromBody] MapModel updatedMap)
    {
        // 1. Verify the campaign exists
        var campaign = await dbContext.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Campaign not found.");

        // 2. Find the specific map and ensure it belongs to this campaign
        var map = await dbContext.Maps.FindAsync(mapId);
        if (map == null || map.CampaignId != id)
            return NotFound("Map not found in the specified campaign.");

        // 3. Update the fields
        map.Title = !string.IsNullOrWhiteSpace(updatedMap.Title) ? updatedMap.Title : map.Title;
        map.ImageUrl = !string.IsNullOrWhiteSpace(updatedMap.ImageUrl) ? updatedMap.ImageUrl : map.ImageUrl;
        map.Description = updatedMap.Description; // Nullable, so we just map it
        map.Category = !string.IsNullOrWhiteSpace(updatedMap.Category) ? updatedMap.Category : map.Category;
        map.IsPublic = updatedMap.IsPublic; // Boolean, so we just map it

        // 4. Update the timestamp
        map.UpdatedAt = DateTime.UtcNow;

        // 5. Save and return
        dbContext.Maps.Update(map);
        await dbContext.SaveChangesAsync();

        return Ok(map);
    }

    /// <summary>
    /// Deletes a map from the specified campaign.
    /// The target campaign is identified by the 'id' parameter, and the specific map to delete is identified by the 'mapId' parameter.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="mapId"></param>
    /// <returns></returns>
    [HttpDelete("{id}/map/{mapId}")]
    public async Task<IActionResult> DeleteMap(Guid id, Guid mapId)
    {
        var map = await dbContext.Maps.FindAsync(mapId);
        if (map == null || map.CampaignId != id) return NotFound();

        dbContext.Maps.Remove(map);
        await dbContext.SaveChangesAsync();
        return NoContent();
    }
}
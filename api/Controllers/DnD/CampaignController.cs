using Api.Datastore;
using Api.Models.Dnd;
using Api.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Api.Services.Users;

namespace Api.Controllers.Dnd;

[Route("api/v1/[controller]")]
[ApiController]
[Authorize]
public class CampaignController(DatabaseContext dbContext, UserInfoService userInfoService) : ControllerBase
{
    // GET: api/v1/campaign/mine
    // Returns all campaigns the logged-in user is part of
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

    // GET: api/v1/campaign/{id}
    // Returns the full state (Quotes, Party, Quests) for a specific campaign
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCampaignDetails(Guid id)
    {
        var campaign = await dbContext.Campaigns
            .Include(c => c.Quotes)
            .Include(c => c.Party)
            .Include(c => c.Quests)
            .Include(c => c.LoreEntries)
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
            Dungeonmaster = new { campaign.DungeonMaster.Id, campaign.DungeonMaster.Username }
        });
    }

    // POST: api/v1/campaign/{id}/quote
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

    // POST: api/v1/campaign/{id}/character
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

    private Guid GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst("id");
        return Guid.Parse(claim.Value);
    }
}
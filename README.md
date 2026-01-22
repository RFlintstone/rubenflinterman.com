# rubenflinterman.com

This repository contains the development of my personal website and API, hosted at https://rubenflinterman.com. It
exists out of the following components:

## Portfolio (v1) - rubenflinterman.com [![Publish Portfolio](https://github.com/RFlintstone/rubenflinterman.com/actions/workflows/publish-portfolio.yml/badge.svg)](https://github.com/RFlintstone/rubenflinterman.com/actions/workflows/publish-portfolio.yml)

A portfolio section to showcase my work and projects. This is currently in progress and will feature various lists and
descriptions of my projects.

## API (v1) - api.rubenflinterman.com [![Publish Api](https://github.com/RFlintstone/rubenflinterman.com/actions/workflows/publish-api.yml/badge.svg)](https://github.com/RFlintstone/rubenflinterman.com/actions/workflows/publish-api.yml)

A C# API project designed to support the functionality of the website:

- Project Structure: Organized structure including Controllers, Models, Services, and Datastore.
- Docker Setup: Using Docker for easy deployment, with a focus on database and Adminer integration.
- JWT Support + Permissions: Implementing JWT for secure access and token management.
- File Storage: Using Postgres and Base64/bytes I'd like to create a 'vault' system where I can SAFELY save, update and request files such as images, PDFs or executables. Using JWT+Permissions this can be very powerfull.

## Blog (v0) - blog.rubenflinterman.com [![Publish Blog](https://github.com/RFlintstone/rubenflinterman.com/actions/workflows/publish-blog.yml/badge.svg)](https://github.com/RFlintstone/rubenflinterman.com/actions/workflows/publish-blog.yml)

A Jekyll-based blog which I'd like to replace with a self-created blog system in v1.
The new version should load blog posts from a database and the included text editor should support full markdown.

## Todo list

<details>
<summary>This is my todo list</summary>
<br>

| **Project**                              | **Task**                                                        | **Status** |
|------------------------------------------|-----------------------------------------------------------------|------------|
| **Portfolio (v1) - rubenflinterman.com** | Setup Quarkus/Java Project                                      | ⏳          |
|                                          | Setup React Frontend                                            | ✅          |
|                                          | Let the React Frontend build to Quarkus                         | ✅          |
|                                          | Configure Quarkus to serve React build                          | ✅          |
|                                          | Setup CI/CD pipeline                                            | ✅          |
|                                          | Implement api.rubenflinterman.com                               | ⏳          |
| **API (v1) - api.rubenflinterman.com**   | Setup C# project                                                | ✅          |
|                                          | _- Create project structure_                                    | ✅          |
|                                          | _- Create Controllers_                                          | ✅          |
|                                          | _- Create Models_                                               | ✅          |
|                                          | _- Create Services_                                             | ✅          |
|                                          | _- Create Datastore_                                            | ✅          |
|                                          | Add docker-compose                                              | ✅          |
|                                          | _- Get DB working (locally)_                                    | ✅          |
|                                          | _- Get DB working (Kubernetes)_                                 | ✅          |
|                                          | _- Get Adminer working (with the DB)__                          | ✅          |
|                                          | Add JWT support                                                 | ⏳          |
|                                          | _- Link Accesstokens with DB by 'SELECT'_                       | ✅          |
|                                          | _- Use a remote server (ex: Firebase/AWS) for token validation_ | ⏳          |
|                                          | Fetch user information                                          | ⏳          |
|                                          | _- Basic user info (id, username, email)_                       | ✅          |
|                                          | _- User Bio in Markdown_                                        | ⏳          |
|                                          | _- Images such as an Avatar_                                    | ✅          |
|                                          | Update user information                                         | ⏳          |
|                                          | _- Basic user info (id, username, email)_                       | ⏳          |
|                                          | _- User Bio in Markdown_                                        | ⏳          |
|                                          | _- Images such as an Avatar_                                    | ⏳          |
| **[Depricated] Blog (v0) - blog.rubenflinterman.com** | Setup Jekyll Blog                                  | ✅          |
|                                          | _- Add Jekyll_                                                  | ✅          |
|                                          | _- Choose Jekyll theme_                                         | ✅          |
|                                          | _- Customize Jekyll theme_                                      | ✅          |
|                                          | _- Add first post_                                              | ✅          |
| **Blog (v1) - blog.rubenflinterman.com** | (Create list)                                                   | ❌          |

| **Status** | **Description** |
|------------|-----------------|
| ✅          | Completed       |
| ⏳          | In Progress     |
| ❌          | To be completed |

</details>




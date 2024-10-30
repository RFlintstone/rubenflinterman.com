# rubenflinterman.com [![Docker](https://github.com/RFlintstone/rubenflinterman.com/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/RFlintstone/rubenflinterman.com/actions/workflows/docker-publish.yml)
This repository contains the development of my personal website and API, hosted at https://rubenflinterman.com. It exists out of the following components:

## Portfolio (v1) - rubenflinterman.com
A portfolio section to showcase my work and projects. This is currently in progress and will feature various lists and descriptions of my projects.

## API (v1) - api.rubenflinterman.com
A C# API project designed to support the functionality of the website:
- Project Structure: Organized structure including Controllers, Models, Services, and Datastore.
- Docker Setup: Using Docker for easy deployment, with a focus on database and Adminer integration.
- JWT Support: Implementing JWT for secure access and token management.

## Blog (v0) - blog.rubenflinterman.com [![Docker](https://github.com/RFlintstone/rubenflinterman.com/actions/workflows/docker-publish.yml/badge.svg?event=registry_package)](https://github.com/RFlintstone/rubenflinterman.com/actions/workflows/docker-publish.yml)
A Jekyll-based blog which I'd like to replace with a self-created blog system in v1.
The new version should load blog posts from a database however the included text editor should support full markdown.

## Todo list
<details>
<summary>This is my todo list</summary>
<br>
  
| **Project**                              | **Task**                                      | **Status** |
|------------------------------------------|-----------------------------------------------|------------|
| **Portfolio (v1) - rubenflinterman.com** | (Create list)                                 | ⏳         |
| **API (v1) - api.rubenflinterman.com**   | Setup C# project                              | ✅         |
|                                          | _- Create project structure_                  | ✅         |
|                                          | Create Controllers                            | ✅         |
|                                          | Create Models                                 | ✅         |
|                                          | Create Services                               | ✅         |
|                                          | Create Datastore                              | ✅         |
|                                          | Add docker-compose                            | ✅         |
|                                          | _- Get DB working_                            | ✅         |
|                                          | _- Get Adminer working (with the DB)_         | ✅         |
|                                          | Add JWT support                               | ✅         |
|                                          | _- Link Accesstokens with DB by 'SELECT'_     | ✅         |
| **Blog (v0) - blog.rubenflinterman.com** | Setup Jekyll Blog                             | ✅         |
|                                          | _- Add Jekyll_                                | ✅         |
|                                          | _- Choose Jekyll theme_                       | ✅         |
|                                          | _- Customize Jekyll theme_                    | ✅         |
|                                          | _- Add first post_                            | ✅         |
| **Blog (v1) - blog.rubenflinterman.com** | (Create list)                                 | ✅         |



| **Status** | **Description**                  |
|------------|----------------------------------|
| ✅         | Completed                        |
| ⏳         | In Progress                      |
| ❌         | To be completed                  |
</details>



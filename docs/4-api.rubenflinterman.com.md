www.api.rubenflinterman.com serves as the brains behind my website.
It includes a token system which makes sure only authorized clients (applications or users) can make a request.
# How it works
The API is relatively simple to understand if you make it a list. It works as follows.
- The client has an access token which has a *long lifespan*.
- The client 'registers' a new connection by providing the api a *valid* access token.
- If the request is OK the client gets a bearer token which has a *short lifespan* which is meant for immediate use.
- The client uses the bearer token do the actual API request (ex. ``/private-endpoint``)
- If the bearer token is not expired the API returns a successful response with the appropriate data (Ex: "Hello World").
# Adding new DB migrations
If you need to add a new migration follow these instructions:
**Prerequisites**
- Make sure the ``hoop.dev`` environment is setup, and you can connect to the server. (For windows the Desktop app is recommended)
- Connect to the ``read-write`` connection to the correct database. This starts a secure tunnel. If you do this with the Windows Desktop App the connection is valid for around 30 minutes.
**Create and upload the migration**
- Create a migration using ``dotnet ef migrations add MigrationName``
- Upload the newly created migration using ``dotnet ef database update``
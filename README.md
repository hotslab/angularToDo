## ANGULAR TODO APPLICATION

### Frameworks used

- Angular
- AdonisJs

NB: Both frameworks use `Javascript` and `NodeJs` to keep the language consistent for easy maintainance


## Prerequisites

- Node
- Mysql / Maria database


## Installation


- Clone the project from the Github repo
```
git clone git@github.com:hotslab/angularToDo.git
```

#### 1. Backend

- Open a separate terminal.
- Install mysql database if you do not have it, either via your linux package distributor or ideally via docker so it can be decoupled from your system.
- Create a database called `angularToDo` or any other name to house the application data.
- Assign a user to manage this database and keep their credentials for further use below. 
- Go to the bakend code for the project.

```
cd angularToDo/backend
```
- Make a copy of the .env.example file and place the mysql database credentials you created earlier into this file.
```
cp .env.example .env
```

- Install the node modules.

```
npm install
```

- Run the migration files to create the tables in your database.
```
node ace migration:refresh
```

- You can `seed` the database to prepopulate it with dummy data (recommended for testing).
```
node ace db:seed
```

- This dummy data provides these two accounts with different privileges you can use to login and test with.

|# | Role |Privileges|Email | Password |
|---|---| ---|--- | --- |
| 1 | Admin | Manages users and personal ToDos | manager@continental.com | test |
| 2 | User | Manages personal ToDos |john.wick@continental.com | boogeyman |  

- To create new `users` just register them in the frontend registration page
- To create new `admins` run the following command below and follow the prompts it shows you
```
node ace create:admin
``` 

- Run the following command to finally `start` the server
```
npm run start
```

- Start the followng command in a separate terminal to automatically create notifications for overdue ToDos, and to remove old unfinished ones.
```
cd angularToDo/backend
npm run cron
```

#### 2. Frontend

- Install angular CLI if not installed to run `ng` commands

```
npm install -g @angular/cli
```

- Open the frontend section in a seperate terminal and go to the project root 

```
cd angularToDo/frontend
```

- Install the node modules
```
npm install
```
- Modifiy the api url in the file `angularToDo/frontend/src/environments/environment.ts` to match the one displayed on the terminal for the `backend` code runing AdonisJs should it be different from what is already in the file. Ensure it is in this format: `${your_full_backend_url}/api/`


- Run the command below to `start` the frontend server and copy the `server url` the terminal shows you, and paste it into the browser to access the site.
```
npm run start
```


## Testing

#### 1. Backend

- Open a separate terminal window and go to the backend root folder.
```
cd angularToDo/backend
``` 
- Run the following code.
```
npm run test
```
- `NB:` This command `removes` the data already in the database. In the future a staging, testing and production database can be created should the application require to be deployed in production, or even for regular staging developemnt to preserve the data. You can run the seeding command again after testing to add back the dummy data again.

#### 2. Frontend

- Open a separate terminal window and go to the frontend root folder.
```
cd angularToDo/frontend
``` 
- Run the following code.
```
npm run test
```

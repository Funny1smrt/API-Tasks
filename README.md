<img src="https://github.com/Funny1smrt/Task-Manager-Frontend/blob/main/public/high-resolution-logo.png?raw=true" width="200" />


# Api-task-manager

Full API with Firebase Auth, MongoDB, Socket.io and Supabase. This is a API for a my project, [Task Manager](https://github.com/username/repo-name).

[![Heroku](https://img.shields.io/badge/deployed%20on-heroku-430098?style=for-the-badge)](https://api-tasks-server-83993e209bd4.herokuapp.com)

## Tech Stack

**Server:** Node, Express, MongoDB, Socket.io, Supabase, Firebase Auth and JWT

## API Reference

#### Get all items

```http
  GET /api/items
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `key`     | `string` | **Required**. Your api key |

| Response | Type    | Description   |
| :------- | :------ | :------------ |
| `items`  | `array` | List of items |

#### Post item

```http
  POST /api/item
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `key`     | `string` | **Required**. Your api key |
| `name`    | `string` | **Required**. Item name    |

#### Delete item

```http
  DELETE /api/item/:id
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `key`     | `string` | **Required**. Your api key |
| `id`      | `string` | **Required**. Item id      |

#### Update item

```http
  PUT /api/item/:id
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `key`     | `string` | **Required**. Your api key |
| `id`      | `string` | **Required**. Item id      |
| `name`    | `string` | **Required**. Item name    |

## Run Locally

Clone the project

```bash
  git clone https://github.com/Funny1smrt/API-Tasks.git
```

Go to the project directory

```bash
  cd API-Tasks
```

Create a `.env` file **[.env Variables](#environment-variables)**

Install dependencies

```bash
  npm install
```

Start the server

```bash
  node server.js
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGO_URI`

`PORT`

`JWT_SECRET`

`FIREBASE_KEY` **(JSON file)**

`SUPABASE_URL`

`SUPABASE_SERVICE_ROLE_KEY`

## Features

- Add, delete, update and get items

- Realtime updates

- Authentication

- Querying

- Sorting

# Hi, I'm Danylo! 👋

## 🚀 About Me

I'm a full stack developer...

## 🛠 Skills

- Javascript, HTML, CSS

- React, Redux, Typescript, Tailwind CSS

- Node.js, Express.js

- MongoDB, Firebase, Supabase

- Socket.io, JWT

## 🔗 Links

[![github](https://img.shields.io/badge/github-1DA1F2?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Funny1smrt)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/danylo-stepanov-2503-react-dev)
[![gmail](https://img.shields.io/badge/gmail-danylo.stepanov.d.s@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:danylo.stepanov.d.s@gmail.com)

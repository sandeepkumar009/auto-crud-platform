# auto-crud-platform

This README covers the core setup and architecture as required by the assignment deliverables.

## 1. How to Run the App

## Backend Setup

1. **Navigate to the backend**:
    ```
    cd backend
    ```
2. **Create Environment File**: Create a `.env` file in the `/backend` directory:
    ```
    DB_HOST=localhost
    DB_USER=your_mysql_user
    DB_PASSWORD=your_mysql_password
    DB_NAME=auto_crud_db

    JWT_SECRET=a_very_strong_and_secret_key

    PORT=8000
    ```

3. **Setup Database**: In your MySQL client, run:
    ```
    CREATE DATABASE auto_crud_db;
    ```

4. **Install Dependencies & Run**:
    ```
    npm install
    npm run dev
    ```

    The server will start on http://localhost:8000.

## Frontend Setup

1. **Navigate to the frontend (in a new terminal)**:
    ```
    cd frontend
    ```

2. **Install Dependencies & Run**:
    ```
    npm install
    npm run dev
    ```

    The React app will start on http://localhost:5173.

## 2. How to Create & Publish a Model

1. **Log In as Admin:**

    - First, register an Admin user via an API client (like Postman) by POSTing to http://localhost:8000/api/auth/register with:

        ```
        {
          "email": "admin@test.com",
          "password": "password123",
          "role": "Admin"
        }
        ```
    - Go to http://localhost:5173 and log in with these credentials.

2. **Navigate to Model Builder:**

    - In the sidebar, click "Model Builder".

3. **Define Your Model:**

    - Fill out the form (e.g., Model Name: Product, Fields: name (string, required), price (number), RBAC rules, etc.).

4. **Publish:**

    - Click the "Publish Model" button.
    - The page will reload, and your new "Product" model will appear in the sidebar. You can now click it to manage its data.

## 3. How File-Write Works

When the Admin submits the form from the "Model Builder," it hits the `POST /api/models/publish` endpoint.

The `modelDefinitionController.js` on the backend receives the model definition as a JSON body. It then uses the Node.js fs (File System) module to save the definition to the filesystem:

`fs.writeFileSync(path.join(..., '/models', 'Product.json'), JSON.stringify(req.body))`

This file acts as the permanent "source of truth" for the model, as specified in the "File-Based Model Persistence" requirement.

## 4. How Dynamic CRUD Endpoints are Registered

This is the core "magic" of the platform, handled by `dynamicService.js` at two different times:

1. **On Server Start**: The `server.js` file calls `initializeDynamicModels()`. This function reads all existing `.json` files from the /models directory and loops over them, registering each one.

2. **On Publish (Hot-Reload)**: When the `modelDefinitionController.js` saves a new file (from the step above), it immediately calls registerAndMount() for that single new model.

The `registerAndMount()` function performs two key actions:

1. `createSequelizeModel()`: Parses the JSON `fields` array, converts JSON types to Sequelize types, defines a new Sequelize model in memory, and calls `model.sync({ alter: true })` to create/alter the table in the MySQL database.

2. `createDynamicRouter()`: Builds a new `express.Router()` object in memory and programmatically adds all 5 CRUD routes (`POST /`, `GET /`, `GET /:id`, `PUT /:id`, `DELETE /:id`), including the RBAC middleware.

Finally, the new router is mounted directly onto the live Express app instance:
`app.use('/api/product', dynamicRouter)`

This all happens instantly, without requiring a server restart.

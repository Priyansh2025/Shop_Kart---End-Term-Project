🛒 ShopKart — Full Stack E-Commerce Application

ShopKart is a full-stack e-commerce web application built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). It demonstrates full-stack web development concepts, REST API integration, database management, and user authentication.

📌 Project Overview

ShopKart provides an e-commerce application structure with a React frontend and a Node.js/Express backend connected to MongoDB.

The project demonstrates how frontend components communicate with backend APIs, how data is stored and retrieved from a database, and how authenticated users can access protected functionality.

✨ Features
Product Management: Retrieve and display product information.
Product Search: Search products using query parameters.
Product Details: Retrieve information about individual products.
Customer Management: Customer-related API functionality.
User Authentication: JWT-based authentication using cookies.
Protected Routes: Middleware verifies authentication before allowing access to protected endpoints.
Wishlist Management: Add products to and remove products from a customer's wishlist.
MongoDB Integration: Store and retrieve application data using MongoDB.
REST API: Separate frontend and backend with API-based communication.
🛠️ Technology Stack
Technology	Purpose
React.js	Frontend user interface
Vite	Frontend development server and build tool
Node.js	Backend JavaScript runtime
Express.js	Backend server and REST APIs
MongoDB	Database
Mongoose	MongoDB object modeling
JSON Web Tokens (JWT)	Authentication
Cookies	Authentication token storage and transmission
JavaScript	Application logic
Git & GitHub	Version control and project hosting
📂 Project Structure
Shop_Kart_Project/
│
├── Client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── Server/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── package.json
│   └── ...
│
└── README.md

Note: The exact subfolders may differ depending on the implementation in your repository.

⚙️ Installation and Setup
Prerequisites

Install the following before running the project:

Node.js
npm, included with Node.js
A MongoDB database, either local MongoDB or MongoDB Atlas
Git
1. Clone the Repository
git clone https://github.com/Priyansh2025/Shop_Kart---End-Term-Project.git

Navigate into the project directory:

cd Shop_Kart---End-Term-Project
2. Set Up the Backend

Open a terminal and run:

cd Server
npm install

Configure the environment variables required by the backend.

Create a .env file inside the Server directory and add the appropriate values. For example:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Important: These are example variable names. Check the backend code to confirm the exact names your application expects.

Start the backend using the script defined in Server/package.json. If the project defines a start script, use:

npm start

If it defines a dev script instead, use:

npm run dev
3. Set Up the Frontend

Open another terminal:

cd Client
npm install

Start the frontend using the development script:

npm run dev

Vite will display the local URL in the terminal. Open that URL in your browser.

Note: The backend port, frontend API URL, and environment variable names must match your actual project configuration.

🔌 API Functionality

The backend provides REST API functionality for managing products, customers, authentication, and wishlists.

Resource	Functionality
Products	Retrieve product information
Product Search	Filter products using search parameters
Product Details	Retrieve an individual product
Customers	Access customer-related functionality
Authentication	Verify users using JWT-based authentication
Wishlist	Add and remove products from a customer's wishlist

The exact endpoint URLs and HTTP methods can be found in the backend route files under the Server directory.

🔐 Authentication and Security

The application demonstrates several authentication and security concepts:

JWT-based authentication.
Cookie-based token handling.
Authentication middleware for protected routes.
Validation of authenticated user access.
Prevention of duplicate wishlist entries.

For security, database credentials and JWT secrets should be stored in environment variables rather than committed to the repository.

🗄️ Database

ShopKart uses MongoDB to store application data.

The application includes product and customer-related data models. Customer wishlist functionality uses references to products, allowing product documents to be associated with a customer's wishlist.

🚀 Future Improvements

Potential enhancements include:

Shopping cart and checkout functionality.
Payment gateway integration.
Order history and order tracking.
Product reviews and ratings.
Product categories and advanced filtering.
Improved form validation and error handling.
Responsive UI improvements.
Automated testing.

These are potential future enhancements, not claims about currently implemented functionality.

🎓 Learning Outcomes

This project demonstrates practical experience with:

Building a frontend using React.
Developing backend APIs using Express.js and Node.js.
Integrating MongoDB with a web application.
Implementing JWT-based authentication.
Protecting API endpoints using middleware.
Managing relationships between database documents.
Connecting frontend components to backend services.
Using Git and GitHub for version control.
👨‍💻 Author

Priyansh Khanna

GitHub: Priyansh2025

📄 License

This project was developed for educational purposes as a full-stack web development end-term project.

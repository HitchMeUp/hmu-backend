# hmu-backend

Set-Up:  
Put Google API Key into /services/googleClient.js  
Start MongoDB.  
  
To run:  
npm install  
npm start  
  
  
API:  
  
Auth:  
POST /auth/register  
{  
  email: String,  
  password: String,  
  firstname: String,  
  surname: String  
  /* OPTIONAL */  
  birthdate: Date,  
  description: String,  
  car {  
    capacity: Number,  
    color: String,  
    year: Number,  
    brand: String,  
    model: String  
  }  
}  
  
POST /auth/login  
{  
  email: String,  
  password: String  
}  
  
  
POST /auth/logout
{}
  
   
//////////////////////////////////////  
  
PUT /api/user/profile  
GET /api/user/profile  
  
  
GET /api/hitchRequest/:id  
GET /api/hitchRequest  
POST /api/hitchRequest/accept/:id  
POST /api/hitchRequest/decline/:id  
POST /api/hitchRequest  
{  
  from: String,  
  to: String,  
  seatsNeeded: Number - default 1 // functionality not yet implemented  
}   
  
//////////////////////////////////////  
  
GET /api/naviRequest/:id  
GET /api/naviRequest  
POST /api/naviRequest/accept/:id  
POST /api/naviRequest/decline/:id  
POST /api/naviRequest  
{  
  from: String,  
  to: String,  
  maxDetour: Number (in Minutes),  
  availableSeats: Number - default 1 // functionality not yet implemented  
}  


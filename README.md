Initialize the project
npm init -y
npm i nodemon

If you want to  kill the terminal press Ctrl + C,
----------------
Refer to : https://expressjs.com/en/starter/installing.html
1: Create a folder.
2:go inside the folder in Terminal (cd foldername)
3: run npm init -y
4: create a file called index.js inside the folder
5: run npm install express in the terminal
6: run npm install nodemon in the terminal
7:DONT TOUCH PACKAGE-LOCK.JSON FILE
8: Update the script in package.json at line7
update in scripts:
"start":"node index.js"     >> (its npm to run start)
"dev":"nodemon index.js"    >> (npm run dev)

----
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start":"node index.js",
    "dev":"nodemon index.js"
  },
-------------------------------------

Project Structure:
Folders created
1. db
2.middleware
3.model
4.routes

file:
1. .gitignore >> inside >>  node_modules  .env
2. .env
3. index.js
4. db > connection.js
5. middleware > auth.js
6. specific files inside model & routes folder


index.js 
------------------------
const express = require('express')
const app = express()
const Port = 8000

app.get('/',(req,res)=>{
    res.send("Welcome to the App")
})

app.listen(Port,()=>{
    console.log(`Server started at Port no.- ${Port}`)
})
-------------------------
open the terminal
start the server
npm run dev
----------------------
double check  .gitignore
node_module & .env is mentioned or not
>> push to gitHub

//Create model for signup -done
//route for signup -done

//signup flow (front + backend connectivity)
//signin << token will b needed (routes + model)

//complete user routes >> test with postman
//create a dashboard : https://startbootstrap.com/previews/sb-admin-2#google_vignette

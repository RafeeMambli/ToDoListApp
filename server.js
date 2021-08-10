const fs = require('fs');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
app.use(express.json());

app.get('/login', (req,res) => {
  const data = JSON.parse(fs.readFileSync('users.json'));
  let searchresult = data.users.find(function (item) {
      if (item.email == req.query.email && item.password == req.query.password) {
          return item;
      }
  });
  res.json(searchresult); //searchresult
});


app.get('/getitems', (req,res) => {
  const data = JSON.parse(fs.readFileSync('db.json'));
  let searchresult = data.userTasks.find(function (item) {
    if (item.userID == parseInt(req.query.id)) {
        return item;
    }
  });
  console.log("getitems searchresult")
  console.log(searchresult)
  console.log(data)
  res.json(searchresult);
})

app.get('/setitem', (req,res) => {
  const data = JSON.parse(fs.readFileSync('db.json'));
  data.userTasks.find(function (item,index) {
    if (item.userID == parseInt(req.query.id)) {
        item.taskList = JSON.parse(req.query.taskList);
    }
  });
  fs.writeFileSync('db.json', JSON.stringify(data))
  res.status(200).json({msg: "item updated"});
})


app.listen(PORT, ()=>{
  console.log("server is running on localhost:" + PORT);
})

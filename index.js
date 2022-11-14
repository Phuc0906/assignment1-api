/*
APIs
/user/info: GET user information (GET)
/user: Verify User (GET)
/user: update user information (PATCH)
/testype: get all testype (GET)
/class: get class code (GET)
/marking: marking student score (PATCH)
/student/score: Get particular student's score (GET)

*/




const { Client } = require('pg');
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Configure Database Information
const client = new Client({
  connectionString: 'postgres://tmetqytapityin:58b007c27b1ca7f238503b02d08065b5083439661f0eae48f349ddfbc94f4039@ec2-35-170-21-76.compute-1.amazonaws.com:5432/d80n49km5e54ju',
  ssl: {
    rejectUnauthorized: false
  }
});

// Connect to database
client.connect(function(err) {
    if (!err) {
        console.log("Connected");
    }
});

// Get user information by searchning Id
app.get('/user/info', (req, res) => {
  const queryCommand = "SELECT * FROM users_table";
    console.log(req.query);

   const result = client.query(queryCommand).then(response => {
     console.log(response.rows)
      console.log()
      var isSend = false;
      for (let i = 0; i < response.rows.length; i++) {
        if ((response.rows[i].userid === req.query.userid)) {
          console.log("VERIFIED");
          res.send({
            status: "1",
            info: response.rows[i]
          });
          isSend = true;
          
        }
      }
      if (!isSend) {
        res.send({
          status: "0"
        })
      }
      
    });
})

// Verify using password and userid (not encrypted)
// verify user http://localhost:3000/user?userid=s3879362&password=rmit12345
app.get("/user", function(req, res) {
  
  const queryCommand = "SELECT * FROM users_table";
    console.log(req.query);

   const result = client.query(queryCommand).then(response => {
     console.log(response.rows)
      console.log()
      var isSend = false;
      for (let i = 0; i < response.rows.length; i++) {
        if ((response.rows[i].userid === req.query.userid) && (response.rows[i].password === req.query.password)) {
          console.log("VERIFIED");
          res.send({
            status: "1"
          });
          isSend = true;
          
        }
      }
      if (!isSend) {
        res.send({
          status: "0"
        })
      }   
    });
});

// Update User Inforamtion
app.patch('/user', (req, res) => {
  const userid = req.body.usid;
  const name = req.body.name;
  const address = req.body.address;
  const phone_number = req.body.phone_number;
  const email = req.body.email;
  var updateCommand = `UPDATE users_table SET name = '${name}', address = '${address}', phonenumber = '${phone_number}', email = '${email}' WHERE userid LIKE '${userid}';`
  console.log(updateCommand)
  client.query(updateCommand).then(response => {
    res.send({
      status: "1"
    });
  }).catch(err => {
    res.send({
      status: "0"
    })
  })

})

// Add user
app.post('/user', function(req, res) {
  console.log(req.body);
  const arrInformation = [];
  
  const insertCommand = 'INSERT INTO users_table(userid, name, password, address, phonenumber, email) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';
  arrInformation.push(req.body.usid)
  arrInformation.push(req.body.name);
  arrInformation.push(req.body.password);
  arrInformation.push(req.body.address);
  arrInformation.push(req.body.phone_number);
  arrInformation.push(req.body.email);

  client.query(insertCommand, arrInformation).then(res => {
    console.log(res);
  }).catch(err => {
    console.log(err);
  })
  res.send("Recieved")
})

// marking API 
app.patch('/marking', (req, res) => {
  const info = req.body.info;
  for (let i = 0; i < info.length; i++) {
    const updateCommand = `UPDATE exam SET score = '${info[i].score}' WHERE sid LIKE '${info[i].sid}' AND examtype LIKE '${info[i].examtype}' AND subject LIKE '${info[i].subject}' `
    client.query(updateCommand).then(response => {
      console.log(response);
    }).catch(err => {
      console.log(err);
    })
    console.log(updateCommand)
  }
  

  res.send(info);
});

//get test type
app.get('/testype', (req, res) => {
  var isSend = false;
  const queryCommand = 'SELECT DISTINCT examtype FROM exam';
  client.query(queryCommand).then(response => {
    console.log(response);
    res.send({
      status: "1",
      info: response.rows
    })

    isSend = true;
  }).catch(err => {
    console.log(err);
    res.send({
      staus: "0"
    })
  })
})

// get classes
app.get('/class', (req, res) => {
  var isSend = false;
  const queryCommand = 'SELECT DISTINCT classcode FROM studying';
  client.query(queryCommand).then(response => {
    console.log(response);
    res.send({
      status: "1",
      info: response.rows
    })

    isSend = true;
  }).catch(err => {
    console.log(err);
    res.send({
      staus: "0"
    })
  })

  
});

//get score list
app.get('/student/scorelist', (req, res) => {
    const classCode = req.query.classcode;
    const examType = req.query.examtype;
    const subject = req.query.subject;

    const queryCommand = `SELECT * FROM exam WHERE examtype LIKE '${examType}' AND subject LIKE '${subject}' AND sid IN (SELECT sid FROM studying WHERE classcode LIKE '${classCode}')`;
    
    // const queryCommand = "SELECT * FROM studying WHERE classcode LIKE '10A2'"
    client.query(queryCommand).then(response => {
        console.log(response);
        res.send({
          status: "1",
          info: response.rows
        })
    
        isSend = true;
      }).catch(err => {
        console.log(err);
        res.send({
          staus: "0"
        })
      })
})

// student score
app.get('/student/score', (req, res) => {
  const stdid = req.query.stdid;
  const testype = req.query.examtype;
  const queryCommand = `SELECT subject, score FROM exam WHERE sid LIKE '${stdid}' AND examtype LIKE '${testype}'`;
  client.query(queryCommand).then(response => {
    console.log(response);
    res.send({
      status: "1",
      info: response.rows
    })

    isSend = true;
  }).catch(err => {
    console.log(err);
    res.send({
      staus: "0"
    })
  })
})

app.listen(process.env.PORT || 8080, function() {
  console.log("App listinging")
})

const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const qs = require('querystring');
const newsRoutes = require('./route/newsRoutes.js');
const roomsRoutes = require('./route/roomsRoutes.js');
const usersRoutes = require('./route/usersRoutes.js');
const issueRoutes = require('./route/issuesRoutes.js');

const app = express();

// Database connection
mongoose.Promise = global.Promise;
var options = {
    useMongoClient: true,
    user: '',
    pass: ''
};
mongoose.connect('', options).then(
    () => {
        console.log('Successfully connected to database.');
    },
    (err) => {
        console.error('Error: Cannot connect to DB (${err.message})');
    }
);

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Middleware route to support CORS and preflighted requests
app.use(function (req, res, next) {
    // Enabling CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, DELETE');
        return res.status(200).json({});
    }
    next();
});

app.get('/', function (req, res) {
    res.redirect('https://clararoomsapi.docs.apiary.io');
});

// Departments route
var roomsRouter = express.Router();
roomsRouter.get('/', roomsRoutes.getDepartmentsList);
roomsRouter.get('/:deptName/roomlist', roomsRoutes.getRoomList);
roomsRouter.get('/:deptName/:roomName', roomsRoutes.getRoomInfo);
roomsRouter.get('/:deptName', roomsRoutes.getAvailableRooms);
app.use('/departments', roomsRouter);

// News route
var newsRouter = express.Router();
newsRouter.get('/:deptName', newsRoutes.getNewsByDepartment);
app.use('/news', newsRouter);

// Users route
var userRouter = express.Router();
userRouter.route('/:email')
    .get(usersRoutes.getUser)
    .put(usersRoutes.updateUser);
userRouter.post('/', usersRoutes.insertUser);
app.use('/users', userRouter);

// Issues route
var issueRouter = express.Router();
issueRouter.route('/')
    .get(issueRoutes.getIssues)
    .post(issueRoutes.insertIssue)
    .delete(issueRoutes.deleteIssue);
app.use('/issues', issueRouter);

// Handle invalid requests
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Handle internal errors
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});

// Start server
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));
console.log('Server started! Running on port: ' + app.get('port'));
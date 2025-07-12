const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

const PORT = process.env.PORT || 3000;

//Routes
const adminRoutes = require('./routes/admin/adminRoutes');
const userRoutes = require('./routes/user/userRoutes');
const questionRoutes = require('./routes/question/questionRoutes');
const mediaRoutes = require('./routes/media/mediaRoutes');
const answerRoutes = require('./routes/answer/answerRoutes');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL],
    credentials: true // Allow cookies to be sent
}));
app.use(morgan('dev'));


app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/answer", answerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});




const express=require('express')
const app=express()
const path=require('path')
const mongoose=require('mongoose');
const StudentSchema=require('./models/Student.js');
const ClassroomSchema=require('./models/Classroom.js');
const StaffSchema=require('./models/Staff.js');


app.use(express.urlencoded({extended:true}));
app.use(express.json())
app.use(express.static(path.join(__dirname,"public")));

app.set('view engine', 'ejs');
app.set("views",path.join(__dirname,"views"));


mongoose.connect('mongodb+srv://prudhvi:oxHbUdozYPR0459t<password>@cluster0.97zyb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', 
    { useNewUrlParser: true, 
    useUnifiedTopology: true
 }).then(()=>{
    console.log("connected");
 }).catch((err)=>{
    console.log(err);
 })

app.get("/",(req,res)=>{
    console.log("login request received");
    res.render('login.ejs',{});
})
app.post('/login', async (req, res) => {
    const { username, userType, password } = req.body;
    console.log(username,userType,password);
    if (userType === 'student') {
        // Find the student by name
        const student = await StudentSchema.findOne({ name: username ,password});
        if (!student) {
            return res.status(400).send('students Invalid username or password');
        }

        // Redirect to the student dashboard
        res.redirect(`/student-dashboard/${student._id}`);
    } else {
        // Find the staff member by name and role (teacher or principal)
        const staff = await StaffSchema.findOne({ name: username, role: userType });
       console.log(staff);
        if (!staff || staff.password !== password) {
            return res.status(400).send('Invalid username or password');
        }

        // Redirect based on the staff role
        if (staff.role === 'principal') {
            res.redirect('/principal');
        } else if (staff.role === 'teacher') {
            return res.redirect(`/teacher/${staff._id}`);
        } else {
            res.status(400).send('Invalid role');
        }
    }
});
app.get('/principal', async (req, res) => {
    const schoolName = "Wanaparthy High School"; // Example school name
    const classes = await ClassroomSchema.find().populate('teacher students');
    const teachers = await StaffSchema.find({ role: 'teacher' });
    const students = await StudentSchema.find(); // Fetch all students
    res.render('principal', { schoolName, classes, teachers, students });
});
app.post('/create-class', async (req, res) => {
    const { className, teacherId, timings } = req.body;

    try {
        const newClassroom = new ClassroomSchema({
            name: className,
            teacher: teacherId,
            timings: timings,
            students: []
        });
        await newClassroom.save();
        res.redirect('/principal');
    } catch (error) {
        res.status(500).send('Error creating class');
    }
});
app.post('/add-student/:classroomId', async (req, res) => {
    const { classroomId } = req.params;
    const { studentId } = req.body;

    try {
        await ClassroomSchema.findByIdAndUpdate(classroomId, {
            $push: { students: studentId }
        });

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false });
    }
});
app.post('/remove-student/:classroomId/:studentId', async (req, res) => {
    const { classroomId, studentId } = req.params;

    try {
        await ClassroomSchema.findByIdAndUpdate(classroomId, {
            $pull: { students: studentId }
        });

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false });
    }
});
app.post('/delete-class/:classroomId', async (req, res) => {
    const { classroomId } = req.params;

    try {
        await ClassroomSchema.findByIdAndDelete(classroomId);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false });
    }
});
// Teacher dashboard route
app.get('/teacher/:teacherId', async (req, res) => {
    const { teacherId } = req.params;
    const schoolName = "Wanaparthy High School";

    try {
        const teacher = await StaffSchema.findById(teacherId);
        const classes = await ClassroomSchema.find({ teacher: teacherId }).populate('students');

        if (teacher) {
            res.render('teacher', { teacherName: teacher.name, classes,schoolName });
        } else {
            res.status(404).send('Teacher not found');
        }
    } catch (error) {
        res.status(500).send('Error loading teacher dashboard');
    }
});
app.post('/teacher/remove-student/:classroomId/:studentId', async (req, res) => {
    const { classroomId, studentId } = req.params;

    try {
        await ClassroomSchema.findByIdAndUpdate(classroomId, {
            $pull: { students: studentId }
        });

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false });
    }
});
app.get('/student-dashboard/:studentId', async (req, res) => {
    const { studentId } = req.params;
    const schoolName = "Wanaparthy High School";
    console.log(studentId);

    try {
        // Fetch the student
        const student = await StudentSchema.findById(studentId);
        if (!student) {
            return res.status(404).send('Student not found');
        }

        // Fetch classes that the student is part of
        const classes = await ClassroomSchema.find({ students: studentId }).populate('students teacher');

        res.render('student', { studentName: student.name, classes,schoolName });
    } catch (error) {
        res.status(500).send('Error loading student dashboard');
    }
});
app.listen(8080,()=>{
    console.log("server started");
})

import { useEffect, useState } from "react";
import "./App.css";

function App() {

  const [employee, setEmployee] = useState({
    name: "",
    designation: "",
    department: "",
    email: "",
    image: "",
    status: "",
  });

  const [currentTime, setCurrentTime] = useState("");
  const [status, setStatus] = useState("Not Checked In");
  const [checkInTime, setCheckInTime] = useState("--");
  const [checkOutTime, setCheckOutTime] = useState("--");
  const [workingHours, setWorkingHours] = useState("00 Hr 00 Min 00 Sec");
  const [checkInDate, setCheckInDate] = useState(null);
  const [timer, setTimer] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [attendanceId, setAttendanceId] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Live Clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  if (!window.ZOHO) {
    console.log("Zoho SDK Not Loaded");
    return;
  }

  window.ZOHO.embeddedApp.on("PageLoad", function (data) {
    console.log("Page Load", data);

    let id = data.EntityId;

    if (Array.isArray(id)) {
      id = id[0];
    }

    setEmployeeId(id);

    console.log("Employee ID :", id);

    getEmployeeDetails(id);
  });

  window.ZOHO.embeddedApp.init();
}, []);

  // Working Hours Timer
  useEffect(() => {
    if (isCheckedIn && !isCheckedOut && checkInDate) {
      const interval = setInterval(() => {
        const now = new Date();

        const diff = now - checkInDate;

        const hrs = Math.floor(diff / (1000 * 60 * 60));

        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        setWorkingHours(
          `${hrs.toString().padStart(2, "0")} Hr ${mins
            .toString()
            .padStart(2, "0")} Min ${secs.toString().padStart(2, "0")} Sec`,
        );
      }, 1000);

      setTimer(interval);

      return () => clearInterval(interval);
    }
  }, [checkInDate, isCheckedIn, isCheckedOut]);

  // Check In
 const handleCheckIn = () => {
   console.log("Check In button clicked");
  if (!employeeId) {
    alert("Employee ID not found.");
    return;
  }

  const now = new Date();

  setCheckInDate(now);

  const checkIn = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  setCheckInTime(checkIn);
  setStatus("Present");
  setIsCheckedIn(true);
  setIsCheckedOut(false);

  const attendanceData = {
    Name: `Attendance - ${employee.name}`,
    Employee: {
      id: employeeId,
    },
    Date: now.toISOString().split("T")[0],
    Check_In_Time: now.toISOString(),
    Status: "Present",
  };

  console.log("Creating Attendance:", attendanceData);

  window.ZOHO.CRM.API.insertRecord({
    Entity: "Attandances",
    APIData: attendanceData,
  })
    .then((response) => {
      console.log("Attendance Created:", response);

      if (
        response.data &&
        response.data.length > 0 &&
        response.data[0].details
      ) {
        setAttendanceId(response.data[0].details.id);

        alert("✅ Check In Successful");
      }
    })
    .catch((error) => {
      console.error(error);

      alert("Failed to create attendance.");
    });
};
  // Check Out
const handleCheckOut = () => {
  if (!checkInDate) {
    alert("Please Check In First");
    return;
  }

  const now = new Date();

  setCheckOutTime(
    now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  );

  clearInterval(timer);

  const diff = now - checkInDate;

  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  setWorkingHours(
    `${hrs.toString().padStart(2, "0")} Hr ${mins
      .toString()
      .padStart(2, "0")} Min ${secs.toString().padStart(2, "0")} Sec`,
  );

  setIsCheckedOut(true);

  // ----------------------------
  // Zoho CRM Update Attendance
  // ----------------------------

  if (!attendanceId) {
    alert("Attendance record not found.");
    return;
  }

  const workingHoursDecimal = (
    (now - checkInDate) /
    (1000 * 60 * 60)
  ).toFixed(2);

  window.ZOHO.CRM.API.updateRecord({
    Entity: "Attandances",
    APIData: {
      id: attendanceId,
      Check_Out_Time: now.toISOString(),
      Working_Hours: workingHoursDecimal,
      Status: "Present",
    },
  })
    .then((response) => {
      console.log("Attendance Updated:", response);
      alert("✅ Check Out Successful");
    })
    .catch((error) => {
      console.error("Update Error:", error);
      alert("Failed to update Attendance");
    });
};
  const getEmployeeDetails = (recordId) => {
  if (!window.ZOHO) return;

  window.ZOHO.CRM.API.getRecord({
    Entity: "Employees",
    RecordID: recordId,
  })
    .then((response) => {
      console.log("Employee Response", response);

      if (response.data && response.data.length > 0) {
        const emp = response.data[0];

        setEmployee({
          name: emp.Name || "",
          designation: emp.Designation || "",
          department: emp.Department || "",
          email: emp.Email || "",
          image: emp.Record_Image || "",
          status: emp.Status || "",
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

  return (
    <>
      {/* Navbar */}

      <nav className="navbar">
        <div className="logo">🏢 Attendance Management</div>

        <div className="nav-right">
          <span>🔔</span>

          <div className="profile">{employee.name.charAt(0)}</div>
        </div>
      </nav>

      {/* Main */}

      <div className="main">
        <div className="attendance-card">
          <div className="header">
           <div className="avatar">
  {employee.image ? (
    <img
      src={employee.image}
      alt="Employee"
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />
  ) : (
    employee.name?.charAt(0)
  )}
</div>

            <div>
              <h2>{employee.name}</h2>
              <p>{employee.designation}</p>
            </div>
          </div>

          <div className="grid">
            <div className="box">
              <h4>Date</h4>
              <p>{today}</p>
            </div>

            <div className="box">
              <h4>Current Time</h4>
              <p>{currentTime}</p>
            </div>
          </div>

          <div
            className={`status ${
              status === "Present" ? "present" : "notpresent"
            }`}
          >
            {status}
          </div>

          <div className="grid">
            <div className="box">
              <h4>Check In</h4>
              <p>{checkInTime}</p>
            </div>

            <div className="box">
              <h4>Check Out</h4>
              <p>{checkOutTime}</p>
            </div>
          </div>

          <div className="buttons">
            <button
              className="checkin"
              onClick={handleCheckIn}
              disabled={isCheckedIn}
            >
              ✅ Check In
            </button>

            <button
              className="checkout"
              onClick={handleCheckOut}
              disabled={!isCheckedIn || isCheckedOut}
            >
              🚪 Check Out
            </button>
          </div>

          <div className="summary">
            <h3>Today's Summary</h3>

            <div className="summary-grid">
              <div className="summary-box">
                <h4>Status</h4>
                <p>{status}</p>
              </div>

              <div className="summary-box">
                <h4>Working Hours</h4>
                <p>{workingHours}</p>
              </div>

              <div className="summary-box">
    <h4>Department</h4>
    <p>{employee.department}</p>
</div>
            </div>
          </div>
        </div>
      </div>

      <footer>© 2026 Attendance Management System</footer>
    </>
  );
}


export default App;

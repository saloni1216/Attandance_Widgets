import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const employee = {
    name: "Saloni Singh",
    designation: "Software Engineer",
    shift: "General Shift",
  };

  const [currentTime, setCurrentTime] = useState("");
  const [status, setStatus] = useState("Not Checked In");
  const [checkInTime, setCheckInTime] = useState("--");
  const [checkOutTime, setCheckOutTime] = useState("--");
  const [workingHours, setWorkingHours] = useState("00 Hr 00 Min 00 Sec");
  const [checkInDate, setCheckInDate] = useState(null);
  const [timer, setTimer] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);

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
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);


useEffect(() => {

  if (!window.ZOHO) return;

  window.ZOHO.embeddedApp.on("PageLoad", function (data) {

    console.log("Widget Loaded");

    console.log(data);

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

        const mins = Math.floor(
          (diff % (1000 * 60 * 60)) / (1000 * 60)
        );

        const secs = Math.floor(
          (diff % (1000 * 60)) / 1000
        );

        setWorkingHours(
          `${hrs.toString().padStart(2, "0")} Hr ${mins
            .toString()
            .padStart(2, "0")} Min ${secs
            .toString()
            .padStart(2, "0")} Sec`
        );
      }, 1000);

      setTimer(interval);

      return () => clearInterval(interval);
    }
  }, [checkInDate, isCheckedIn, isCheckedOut]);

  // Check In
  const handleCheckIn = () => {
    const now = new Date();

    setCheckInDate(now);

    setCheckInTime(
      now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );

    setStatus("Present");

    setIsCheckedIn(true);

    setIsCheckedOut(false);
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
      })
    );

    clearInterval(timer);

    const diff = now - checkInDate;

    const hrs = Math.floor(diff / (1000 * 60 * 60));

    const mins = Math.floor(
      (diff % (1000 * 60 * 60)) / (1000 * 60)
    );

    const secs = Math.floor(
      (diff % (1000 * 60)) / 1000
    );

    setWorkingHours(
      `${hrs.toString().padStart(2, "0")} Hr ${mins
        .toString()
        .padStart(2, "0")} Min ${secs
        .toString()
        .padStart(2, "0")} Sec`
    );

    setIsCheckedOut(true);
  };

  return (
    <>
      {/* Navbar */}

      <nav className="navbar">
        <div className="logo">
          🏢 Attendance Management
        </div>

        <div className="nav-right">
          <span>🔔</span>

          <div className="profile">
            {employee.name.charAt(0)}
          </div>
        </div>
      </nav>

      {/* Main */}

      <div className="main">

        <div className="attendance-card">

          <div className="header">

            <div className="avatar">
              {employee.name.charAt(0)}
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
              status === "Present"
                ? "present"
                : "notpresent"
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
                <h4>Shift</h4>
                <p>{employee.shift}</p>
              </div>

            </div>

          </div>

        </div>

      </div>

      <footer>
        © 2026 Attendance Management System 
      </footer>
    </>
  );
}

export default App;
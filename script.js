const form = document.getElementById("attendanceForm");
const messageDiv = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxc7yHrlN6GwPmhYgb_4JEGp-qIrowtx6HJnpLULHICbh1bjUHjuRFleuLR-qGK74m6/exec";

const inputs = document.getElementsByTagName("input");

for (const input of inputs) {
    if (!input.id) continue;
    const savedValue = sessionStorage.getItem(input.id);
    if (savedValue !== null) {
        input.value = savedValue;
    }

    input.onblur = function () {
        window.sessionStorage.setItem(this.id, this.value);
    };
}

function validateFullName(name) {
    name = name.trim();
    if (!name) return "Full Name is required";

    const nameWords = name.split(/\s+/).filter(word => word.length > 0);
    if (nameWords.length <= 2) return "Please enter your full name";

    return null;
}

function validateContact(contact) {
    contact = contact.trim();
    if (!contact) return "Phone or Email is required";

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneReg = /^(?:\+?20|0)?1[0125][0-9]{8}$/;

    if (emailReg.test(contact) || phoneReg.test(contact.replace(/\s|-/g, ""))) 
    {
        return null;
    }
    return "Please enter a valid phone number or email";
}

form.addEventListener("submit", function (e) {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Loading...";

    messageDiv.textContent = "";
    messageDiv.classList = "message";

    const name = document.getElementById("fullName").value;
    const contact = document.getElementById("contact").value;

    const errors = [
        validateFullName(name),
        validateContact(contact)
    ].filter(Boolean);

    if (errors.length > 0)
    {
        showMessage(errors[0], "error");
        resetButton();
        return;
    }

    if (!navigator.geolocation) {
        showMessage("Please enable location services", "error");
        resetButton();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const data = {
                name: document.getElementById("fullName").value.trim(),
                contact: document.getElementById("contact").value.trim(),
                dept: document.getElementById("department").value.trim(),
                year: document.getElementById("year").value,
                sessionCode: document.getElementById("sessionCode").value.trim(),
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            fetch(SCRIPT_URL, {
                    method: "POST",
                    body: JSON.stringify(data)
                }).then(function (response) {
                    if (response.ok) {
                        showMessage("Your attendance has been recorded successfully", "success");
                        form.reset();
                    } else {
                        showMessage("An error occurred, please try again", "error");
                    }
                })
                .catch(function () {
                    showMessage("No internet connection, please try again", "error");
                })
                .finally(function () {
                    resetButton();
                });
        },
        function () {
            showMessage("Location access denied. Please enable location to submit.", "error");
            resetButton();
        }
    );
});

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = "message " + type;
}

function resetButton() {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Attendance";
}
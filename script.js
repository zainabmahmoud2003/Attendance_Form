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

form.addEventListener("submit", function (e) {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "جاري التحميل...";

    messageDiv.textContent = "";
    messageDiv.classList = "message";

    if (!navigator.geolocation) {
        showMessage("يُرجى فتح تحديد الموقع", "error");
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
                        showMessage("تم تسجيل حضورك بنجاح", "success");
                        form.reset();
                    } else {
                        showMessage("حدث خطأ، حاول مرة أخرى", "error")
                    }
                })
                .catch(function () {
                    showMessage("لا يوجد اتصال، حاول مرة أخرى", "error")
                })
                .finally(function () {
                    resetButton();
                });
        })
});

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = "message " + type;
}

function resetButton() {
    submitBtn.disabled = false;
    submitBtn.textContent = "تسجيل حضور";
}
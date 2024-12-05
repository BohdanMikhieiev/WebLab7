document.addEventListener("DOMContentLoaded", () => {
    const playButton = document.getElementById("play");
    const closeButton = document.getElementById("close");
    const startButton = document.getElementById("start");
    const reloadButton = document.getElementById("reload");
    const workArea = document.getElementById("work");
    const animArea = document.getElementById("anim");
    const eventsTable = document.getElementById("event-log");
    const eventsBody = document.querySelector("#event-log tbody");
    const log = document.getElementById("log");

    let balls = [];
    let velocities = [];
    let interval;
    let eventCount = 0;


    const createBall = (color, position) => {
        const ball = document.createElement("div");
        ball.classList.add("ball");
        ball.style.backgroundColor = color;
        ball.style.position = "absolute";
        ball.style.width = "20px";
        ball.style.height = "20px";
        ball.style.borderRadius = "50%";
        ball.style.zIndex = "2";
        ball.style.left = Math.random() * (animArea.offsetWidth - 20) + "px";
        ball.style.top = position === "top" ? "0px" : animArea.offsetHeight - 20 + "px";
        animArea.appendChild(ball);

        const angle = (Math.random() * 360);
        const speed = 5;

        let dx = Math.cos(angle * Math.PI / 180) * speed;
        let dy = Math.sin(angle * Math.PI / 180) * speed;

        velocities.push({ dx, dy });
        return ball;
    };

    playButton.addEventListener("click", () => {
        workArea.style.display = "block";
    });

    closeButton.addEventListener("click", () => {
        workArea.style.display = "none";
        eventsTable.style.display = "block";
        animArea.innerHTML = "";
        balls = [];
        velocities = [];
        clearInterval(interval);
        logEvent("Close button was pressed.");
        showReloadButton();
        loadEvents();
    });

    startButton.addEventListener("click", () => {
        startButton.disabled = true;
        const blueBall = createBall("blue", "top");
        const orangeBall = createBall("orange", "bottom");
        balls.push(blueBall, orangeBall);
        logEvent("Start button was pressed.");

        interval = setInterval(() => {
            moveBalls();
        }, 20);
    });

    const moveBalls = () => {
        let allInTop = true;
        let allInBottom = true;
        balls.forEach((ball, index) => {
            const rect = ball.getBoundingClientRect();
            const ballVelocity = velocities[index];

            let newX = parseInt(ball.style.left) + ballVelocity.dx;
            let newY = parseInt(ball.style.top) + ballVelocity.dy;

            if (newY <= 0 || newY >= animArea.offsetHeight - 20) {
                ballVelocity.dy *= -1;
            }

            if (newX <= 0 || newX >= animArea.offsetWidth - 20) {
                ballVelocity.dx *= -1;
            }

            ball.style.left = newX + "px";
            ball.style.top = newY + "px";

            balls.forEach((otherBall, otherIndex) => {
                if (index !== otherIndex && isCollision(ball, otherBall)) {
                    const tempDx = velocities[index].dx;
                    const tempDy = velocities[index].dy;

                    velocities[index].dx = velocities[otherIndex].dx;
                    velocities[index].dy = velocities[otherIndex].dy;

                    velocities[otherIndex].dx = tempDx;
                    velocities[otherIndex].dy = tempDy;

                    logEvent(`Ball ${index + 1} collided with Ball ${otherIndex + 1}.`);
                }
            });

            const topEdge = newY;
            const bottomEdge = newY + 20; // Висота м'яча 20px
            const halfHeight = animArea.offsetHeight / 2;

            if (bottomEdge <= halfHeight) {
                allInBottom = false;
            } else if (topEdge >= halfHeight) {
                allInTop = false;
            } else {
                allInTop = false;
                allInBottom = false;
            }

            logEvent(`Ball ${index + 1} moved to (${newX}, ${newY}).`);
        });
        if (allInTop || allInBottom) {
            clearInterval(interval);
            logEvent("Game stopped: Both balls are fully in the same half of the area.");
            showReloadButton();
        }
    };

    const showReloadButton = () => {
        reloadButton.style.display = "inline-block";
        startButton.style.display = "none";
    };

    const showStartButton = () => {
        reloadButton.style.display = "none";
        startButton.style.display = "inline-block";
    };

    reloadButton.addEventListener("click", () => {
        balls.forEach(ball => {
            ball.remove();
        });
        balls = [];
        velocities = [];
        startButton.disabled = false;
        showStartButton();
        logEvent("Reload button was pressed.");
    });

    const isCollision = (ball1, ball2) => {
        const rect1 = ball1.getBoundingClientRect();
        const rect2 = ball2.getBoundingClientRect();

        const distance = Math.sqrt(
            Math.pow(rect1.left + 10 - (rect2.left + 10), 2) +
            Math.pow(rect1.top + 10 - (rect2.top + 10), 2)
        );

        return distance < 20;
    };


    const logEvent = (message) => {
        eventCount++;
        const eventTime = new Date().toLocaleTimeString();
        const event = {
            eventNumber: eventCount,
            message: message,
            time: eventTime
        };
        saveEventToLocalStorage(event);
        saveEventToServer(event);
        log.innerHTML = `<p style="font-size:12px;color:black">${eventCount}: ${message} (${eventTime})</p>`;
        const row = `<tr><td>${eventCount}: ${message}</td><td>${eventTime}</td></tr>`;
        eventsBody.innerHTML += row;
    };

    const saveEventToLocalStorage = (event) => {
        let events = JSON.parse(localStorage.getItem("events")) || [];
        events.push(event);
        localStorage.setItem("events", JSON.stringify(events));
    };

    const saveEventToServer = (eventData) => {
        fetch('lab7api-production.up.railway.app/log_event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Event logged:', data);
            })
            .catch(error => console.error('Error:', error));
    };


    const loadEvents = () => {
        fetch('lab7api-production.up.railway.app/events')
            .then(response => response.json())
            .then(data => {
                eventsBody.innerHTML = "";
                data.forEach(event => {
                    const row = `<tr><td>${event.eventNumber}: ${event.message}</td><td>${event.time}</td></tr>`;
                    eventsBody.innerHTML += row;
                });
            })
            .catch(error => console.error('Error loading events:', error));
    };
});
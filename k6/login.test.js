import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    vus: 10,          // 10 users at the same time
    duration: "30s", // run for 30 seconds
};

export default function () {
    const url = "http://localhost:5000/api/auth/login";

    const payload = JSON.stringify({
        email: "superadmin@atari.gov.in",
        password: "SuperAdmin@123",
    });

    const params = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = http.post(url, payload, params);

    check(res, {
        "status is 200": (r) => r.status === 200,
    });

    sleep(1);
}


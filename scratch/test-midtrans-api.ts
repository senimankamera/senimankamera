import fs from "fs";
import path from "path";

try {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
      const parts = line.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error("Failed to load .env:", e);
}

const serverKey = process.env.MIDTRANS_SERVER_KEY;
console.log("Using Server Key:", serverKey);

async function testApi() {
  const endpoint = "https://app.sandbox.midtrans.com/snap/v1/transactions";
  const authHeader = Buffer.from(`${serverKey}:`).toString("base64");

  const payload = {
    transaction_details: {
      order_id: `test-order-${Date.now()}`,
      gross_amount: 150000,
    },
    credit_card: {
      secure: true,
    },
    customer_details: {
      first_name: "Test User",
      email: "testuser@gmail.com",
      phone: "081234567890",
    },
    item_details: [
      {
        id: "test-package",
        price: 150000,
        quantity: 1,
        name: "DP - Test Package",
      }
    ],
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("Status Code:", response.status);
    const text = await response.text();
    console.log("Response Body:", text);
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

testApi();

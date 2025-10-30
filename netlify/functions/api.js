import whois from "whois-json";

export async function handler(event) {
  const { path, rawQuery } = event;

  // ---- /check?=example.com ----
  if (path.includes("/check")) {
    const domain = rawQuery?.replace("=", "").trim();
    if (!domain) return json({ error: "⚠️ Vui lòng nhập ?=tên_miền" }, 400);

    try {
      const info = await whois(domain);
      return json({
        "🌐 Tên miền": info.domainName || domain,
        "👤 Người đăng ký": info.registrantName || info.owner || "Không rõ",
        "🏢 Nhà đăng ký": info.registrar || "Không rõ",
        "📅 Ngày tạo": info.creationDate || "Không rõ",
        "⌛ Ngày hết hạn": info.registryExpiryDate || info.expirationDate || "Không rõ",
        "🔐 DNSSEC": info.dnssec || "Không có",
        "🖥️ Name Servers": info.nameServer || info.nameServers || "Không rõ",
        "📋 Trạng thái": info.status || "Không rõ",
      });
    } catch (e) {
      return json({ error: "❌ Không thể tra thông tin tên miền." }, 500);
    }
  }

  // ---- /date?=1/1/2023 ----
  if (path.includes("/date")) {
    const input = rawQuery?.replace("=", "").trim();
    if (!input) return json({ error: "⚠️ Vui lòng nhập ?=ngày/tháng/năm" }, 400);

    const [d, m, y] = input.split("/").map(Number);
    const inputDate = new Date(y, m - 1, d);
    const now = new Date();

    if (isNaN(inputDate)) return json({ error: "❌ Sai định dạng, dùng dd/mm/yyyy" }, 400);

    const diff = Math.floor((now - inputDate) / (1000 * 60 * 60 * 24));
    const status = diff >= 0 ? "trước" : "sau";
    const abs = Math.abs(diff);

    return json({
      "📅 Ngày nhập": input,
      "📆 Ngày hiện tại": `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
      "⏳ Số ngày": `${abs} ngày (${status})`,
    });
  }

  // ---- Default ----
  return json({ message: "Dùng /check?=domain hoặc /date?=dd/mm/yyyy" });
}

// Helper: trả JSON
function json(data, status = 200) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(data, null, 2),
  };
}

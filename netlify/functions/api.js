const API_KEY = "4wpYpPs6O/srBvF8MKhC/g==WlwI1TCnyP8cab4J"; // ← key của bạn

export async function handler(event) {
  const { path, rawQuery } = event;

  // --- /check?=example.com ---
  if (path.includes("/check")) {
    const domain = rawQuery?.replace("=", "").trim();
    if (!domain) return json({ error: "⚠️ Vui lòng nhập ?=tên_miền" }, 400);

    try {
      const res = await fetch(`https://api.api-ninjas.com/v1/whois?domain=${domain}`, {
        headers: { "X-Api-Key": API_KEY },
      });
      const data = await res.json();

      if (!data.domain_name)
        return json({ error: "❌ Không tìm thấy thông tin tên miền." });

      // 🧠 Chuyển timestamp sang dạng ngày
      const toDate = (val) => {
        if (!val) return "Không rõ";
        const t = Array.isArray(val) ? val[0] : val;
        const date = new Date(t * 1000);
        return isNaN(date) ? val : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      };

      return json({
        "🌐 Tên miền": data.domain_name,
        "🏢 Nhà đăng ký": data.registrar || "Không rõ",
        "👤 Người đăng ký": data.registrant || "Không rõ",
        "📅 Ngày tạo": toDate(data.creation_date),
        "⌛ Ngày hết hạn": toDate(data.expiration_date),
        "🔐 DNSSEC": data.dnssec || "Không có",
        "🖥️ Name Servers": Array.isArray(data.name_servers)
          ? data.name_servers.join(", ")
          : data.name_servers || "Không rõ",
        "📋 Trạng thái": data.status || "Không rõ",
      });
    } catch (err) {
      return json({ error: "❌ Lỗi khi kết nối WHOIS API." });
    }
  }

  // --- /date?=1/1/2023 ---
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

  // --- Default ---
  return json({ message: "Dùng /check?=domain hoặc /date?=dd/mm/yyyy" });
}

function json(data, status = 200) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(data, null, 2),
  };
}

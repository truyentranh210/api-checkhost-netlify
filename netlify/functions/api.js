export async function handler(event) {
  const { path, rawQuery } = event;

  // --- /check?=example.com ---
  if (path.includes("/check")) {
    const domain = rawQuery?.replace("=", "").trim();
    if (!domain) return json({ error: "⚠️ Vui lòng nhập ?=tên_miền" }, 400);

    try {
      // Dùng API công khai miễn phí — không cần cài gói
      const res = await fetch(`https://api.domainsdb.info/v1/domains/search?domain=${domain}`);
      const data = await res.json();

      if (!data.domains || data.domains.length === 0)
        return json({ error: "❌ Không tìm thấy thông tin tên miền." });

      const info = data.domains[0];
      return json({
        "🌐 Tên miền": info.domain,
        "🏢 Nhà đăng ký": info.registrar || "Không rõ",
        "📅 Ngày tạo": info.create_date || "Không rõ",
        "⌛ Ngày hết hạn": info.expire_date || "Không rõ",
        "🖥️ Name Servers": info.name_servers?.join(", ") || "Không rõ",
        "📋 Trạng thái": info.is_dead ? "Không hoạt động" : "Hoạt động",
      });
    } catch (err) {
      return json({ error: "❌ Không thể kết nối API tra cứu." });
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

// Helper trả JSON
function json(data, status = 200) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(data, null, 2),
  };
}

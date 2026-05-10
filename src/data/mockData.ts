export const studentInfo = {
  name: "Anh Thư",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnhThu&backgroundColor=b6e3f4",
  stats: {
    totalSubmitted: 15,
    averageScore: 8.2,
    bestSkill: "Diễn đạt & Lập luận"
  }
};

export const progressData = [
  { week: 'Tuần 1', score: 6.5 },
  { week: 'Tuần 2', score: 7.0 },
  { week: 'Tuần 3', score: 6.8 },
  { week: 'Tuần 4', score: 7.5 },
  { week: 'Tuần 5', score: 8.0 },
  { week: 'Tuần 6', score: 8.5 },
];

export const skillsData = [
  { subject: 'Kiến thức', A: 85, fullMark: 100 },
  { subject: 'Logic', A: 75, fullMark: 100 },
  { subject: 'Phản biện', A: 90, fullMark: 100 },
  { subject: 'Diễn đạt', A: 88, fullMark: 100 },
  { subject: 'Liên hệ thực tế', A: 70, fullMark: 100 },
];

export const recentSubmissions = [
  { id: 1, title: 'Bản sắc văn hóa dân tộc trong thời kỳ hội nhập', date: '10/05/2026', score: 8.5, status: 'Đã chấm' },
  { id: 2, title: 'Nguyên nhân thắng lợi của Cách mạng tháng Tám', date: '05/05/2026', score: 9.0, status: 'Đã chấm' },
  { id: 3, title: 'Tác động của chiến tranh lạnh đến Châu Á', date: '28/04/2026', score: 7.5, status: 'Đã chấm' },
];

export const sampleResult = {
  text: "Cách mạng tháng Tám năm 1945 là một sự kiện vĩ đại trong lịch sử dân tộc ta. [Thắng lợi này không chỉ lật đổ ách thống trị của thực dân Pháp và phát xít Nhật, mà còn xóa bỏ chế độ phong kiến tồn tại hàng ngàn năm]. Đảng ta đã lãnh đạo nhân dân chớp lấy thời cơ ngàn năm có một để vùng lên khởi nghĩa. Tuy nhiên, nếu thiếu đi [sự ủng hộ của các cường quốc đồng minh], cuộc cách mạng có thể đã gặp nhiều khó khăn hơn. Nhìn chung, đây là kết quả của sự chuẩn bị lâu dài và tinh thần đoàn kết toàn dân.",
  highlights: [
    { text: "Thắng lợi này không chỉ lật đổ ách thống trị của thực dân Pháp và phát xít Nhật, mà còn xóa bỏ chế độ phong kiến tồn tại hàng ngàn năm", type: "positive", comment: "Ý này rất chính xác và tóm tắt được ý nghĩa cốt lõi." },
    { text: "sự ủng hộ của các cường quốc đồng minh", type: "warning", comment: "Cần cẩn thận ở điểm này. Trọng tâm chính là nội lực và sự chuẩn bị của Đảng, ngoại lực chỉ là yếu tố khách quan thuận lợi." }
  ],
  score: 8.5,
  rubric: [
    { criteria: "Kiến thức lịch sử (4đ)", maxScore: 4, score: 3.5, description: "Kiến thức cơ bản tốt, nhưng vài chỗ chưa thực sự sắc sảo." },
    { criteria: "Lập luận & Logic (3đ)", maxScore: 3, score: 2.5, description: "Mạch văn rõ ràng, có sự liên kết giữa các ý." },
    { criteria: "Diễn đạt (2đ)", maxScore: 2, score: 2.0, description: "Hành văn mạch lạc, từ ngữ sử dụng phù hợp với văn phong lịch sử." },
    { criteria: "Liên hệ sáng tạo (1đ)", maxScore: 1, score: 0.5, description: "Có tự duy riêng nhưng cần dẫn chứng thực tế mạnh hơn." }
  ],
  feedback: {
    praise: [
      "Nắm vững các mốc sự kiện chính của Cách mạng tháng Tám.",
      "Diễn đạt trôi chảy, không có lỗi chính tả hay ngữ pháp.",
      "Có tư duy tổng hợp tốt khi nhắc đến các yếu tố kẻ thù."
    ],
    warnings: [
      "Đánh giá hơi cao vai trò của Đồng minh, dễ làm lu mờ sự chủ động của ta.",
      "Chưa phân tích sâu về 'thời cơ ngàn năm có một' cụ thể là gì (Nhật đầu hàng Đồng minh)."
    ],
    guidance: "Em nên bổ sung thêm ý nghĩa về mặt quốc tế của Cách mạng tháng Tám để bài viết sâu sắc hơn. Cụ thể, thắng lợi này đã cổ vũ mạnh mẽ phong trào giải phóng dân tộc trên thế giới, đặc biệt là ở Châu Á và Châu Phi. Thử viết thêm 1 đoạn: 'Không chỉ mang ý nghĩa quốc gia, Cách mạng tháng Tám còn chọc thủng khâu yếu nhất trong hệ thống thuộc địa của chủ nghĩa đế quốc...'"
  }
}

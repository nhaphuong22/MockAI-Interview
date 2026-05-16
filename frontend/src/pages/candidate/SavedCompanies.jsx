export function SavedCompanies() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl mb-2">Các Công Ty Đã Lưu</h1>
        <p className="text-gray-600 mb-8">Theo dõi các công ty bạn quan tâm</p>
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-600">Chưa có công ty nào được lưu</p>
        </div>
      </div>
    </div>
  );
}

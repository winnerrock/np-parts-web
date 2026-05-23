export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h3 className="text-[#E8B84B] font-bold text-lg mb-2">NP อะไหล่ยนต์</h3>
          <p className="text-sm leading-relaxed">
            จำหน่ายอะไหล่รถยนต์ครบวงจร<br />
            ทุกยี่ห้อ ทุกรุ่น ราคายุติธรรม<br />
            Since 1994
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">ติดต่อเรา</h3>
          <p className="text-sm leading-relaxed">
            7/1 ม.1 ต.โคกกรวด อ.เมือง<br />
            จ.นครราชสีมา 30280<br />
            โทร. 044-291-419, 044-291-319
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">เวลาทำการ</h3>
          <p className="text-sm leading-relaxed">
            จันทร์ – เสาร์<br />
            08:00 – 17:30 น.
          </p>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs">
        © 2024 หจก.นพอะไหล่ยนต์ · All rights reserved
      </div>
    </footer>
  )
}

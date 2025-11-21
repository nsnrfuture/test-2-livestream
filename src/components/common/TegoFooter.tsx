export default function TegoFooter() {
  return (
    <footer className="bg-[#111] border-t border-white/10 mt-10 py-6 px-6 md:px-10 text-center text-white/60 text-sm">
      <p>© {new Date().getFullYear()} Tego Live— All rights reserved.</p>

      <div className="mt-3 flex justify-center gap-6 text-xs">
        <a href="/privacy-policy
        " className="hover:text-white transition">Privacy Policy</a>
        <a href="/terms-and-conditions" className="hover:text-white transition">Terms of Conditions</a>
        <a href="/cancellations-and-refunds" className="hover:text-white transition">Cancellations and Refunds</a>
        <a href="/contact" className="hover:text-white transition">Contact</a>
      </div>
    </footer>
  );
}

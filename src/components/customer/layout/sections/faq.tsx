import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
 {
    question: "Apakah rental wajib dilakukan jika sudah melakukan fitting?",
    answer:
      "Rental tidak diwajibkan untuk dilakukan jika memang tidak ada produk yang sesuai dengan keinginan Anda.",
    value: "item-1",
  },
  {
    question: "Apakah rental dapat dilakukan secara online tanpa fitting terlebih dahulu?",
    answer:
      "Tidak bisa. Untuk memastikan pakaian pas dan sesuai dengan keinginan Anda, kami mewajibkan semua pelanggan untuk melakukan sesi fitting di lokasi kami sebelum menyelesaikan proses sewa.",
    value: "item-2",
  },
  {
    question: "Berapa lama durasi standar untuk menyewa satu pakaian?",
    answer:
      "Durasi sewa standar kami adalah 3 (tiga) hari. Jika Anda memerlukan waktu sewa yang lebih lama, silakan diskusikan dengan tim kami saat sesi fitting untuk penyesuaian biaya.",
    value: "item-3",
  },
  {
    question: "Apa yang terjadi jika pakaian yang saya sewa rusak atau hilang?",
    answer:
      "Pelanggan bertanggung jawab atas pakaian yang disewa. Untuk kerusakan kecil, mungkin akan ada biaya perbaikan. Untuk kerusakan besar atau kehilangan, pelanggan akan dikenakan biaya penggantian sesuai dengan nilai pakaian tersebut.",
    value: "item-4",
  },
  {
    question: "Metode pembayaran apa saja yang diterima?",
    answer:
      "Kami menerima berbagai metode pembayaran, termasuk transfer bank, kartu kredit/debit, dan dompet digital (e-wallet) yang tersedia saat Anda melakukan checkout di aplikasi.",
    value: "item-5",
  },
  {
    question: "Bisakah saya membatalkan pesanan sewa yang sudah dikonfirmasi?",
    answer:
      "Pesanan yang sudah dibayar tidak dapat dibatalkan atau diuangkan kembali (non-refundable). Namun, Anda dapat mengajukan perubahan jadwal (reschedule) sewa setidaknya 7 hari sebelum tanggal pengambilan, tergantung ketersediaan produk.",
    value: "item-6",
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="container md:w-[700px] py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
          FAQS
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold">
          Pertanyaan yang Sering Diajukan
        </h2>
      </div>

      <Accordion type="single" collapsible className="AccordionRoot">
        {FAQList.map(({ question, answer, value }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

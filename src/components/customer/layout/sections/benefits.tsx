import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CalendarCheck2, Shirt, Undo2 } from "lucide-react";

interface BenefitsProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const benefitList: BenefitsProps[] = [
  {
    icon: Search,
    title: "Cari Pakaian",
    description:
      "Buka aplikasi, jelajahi ribuan koleksi, atau gunakan filter untuk menemukan gaun, kebaya, atau jas impianmu dengan cepat.",
  },
  {
    icon: Shirt,
    title: "Jadwalkan Fitting",
    description:
      "Atur jadwal fitting di aplikasi untuk mencoba pakaian di butik rekanan terdekat agar ukurannya pas dan nyaman.",
  },
  {
    icon: CalendarCheck2,
    title: "Sewa Sekarang",
    description:
      "Sudah pas dan yakin? Konfirmasi sewa dan selesaikan pembayaran langsung di butik. Ambil pakaianmu dan kamu siap tampil memukau!",
  },
  {
    icon: Undo2,
    title: "Kembalikan Mudah",
    description:
      "Setelah acara selesai, kembalikan pakaian tanpa repot. Antar langsung ke butik atau pilih layanan jemput dari lokasi kamu.",
  },
];

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-2 place-items-center lg:gap-24">
        <div>
          <h2 className="text-lg text-primary-500 mb-2 tracking-wider">On-Rent</h2>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tahapan Sewa Pakaian
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Lakukan tahapan-tahapan berikut untuk menyewa pakaian sesuai dengan kebutuhanmu.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 w-full">
          {benefitList.map(({ icon: Icon, title, description }, index) => (
            <Card
              key={title}
              className="bg-muted/50 dark:bg-card hover:bg-primary-50 transition-all delay-75 group/number"
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <Icon className="h-8 w-8 text-primary-500" />
                  </div>
                  <span className="text-5xl text-muted-foreground/15 font-medium transition-all delay-75 group-hover/number:text-muted-foreground/30">
                    0{index + 1}
                  </span>
                </div>
                <CardTitle className="mt-4">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
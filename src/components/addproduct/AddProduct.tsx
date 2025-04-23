import Card from "components/card";
import { FaPlus } from "react-icons/fa6";

const AddProductWidget = () => {
  return (
    <Card extra="flex flex-col items-center justify-center h-full rounded-[20px] !bg-orange-500 text-white hover:brightness-110 transition-all">
      <div className="flex flex-col items-center justify-center text-center gap-1 h-[90px]">
        <FaPlus className="h-7 w-7"/>
        <span className="text-sm font-semibold">Tambah Produk</span>
      </div>
    </Card>
  );
};

export default AddProductWidget;

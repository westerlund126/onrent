import { IoHeart, IoHeartOutline } from 'react-icons/io5';
import { useState, useMemo } from 'react';
import Card from 'components/card';
import Image from 'next/image';

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    images: string[];
    owner: { id: number; username: string };
    VariantProducts: {
      id: number;
      price: number;
    }[];
  };
  extra?: string;
};

const ProductCard = ({ product, extra }: ProductCardProps) => {
  const [liked, setLiked] = useState(false);

  const minPrice = useMemo(() => {
    return Math.min(...product.VariantProducts.map((v) => v.price));
  }, [product.VariantProducts]);

  return (
    <Card
      extra={`flex flex-col w-full h-full !p-4 3xl:p-![18px] bg-white ${extra}`}
    >
      <div className="relative w-full">
        <Image
          width={500}
          height={800}
          className="mb-3 h-80 w-full rounded-xl object-cover"
          src={product.images[0]}
          alt={product.name}
        />
        <button
          onClick={() => setLiked(!liked)}
          className="absolute right-3 top-3 flex items-center justify-center rounded-full bg-white p-2 text-brand-500 hover:cursor-pointer"
        >
          {liked ? <IoHeart className="text-brand-500" /> : <IoHeartOutline />}
        </button>
      </div>

      <div className="mt-2">
        <p className="text-lg font-bold text-navy-700">{product.name}</p>
        {/* <p className="text-sm text-gray-500">By {product.owner.name}</p> */}
        <div className='col-span-2 flex items-center justify-between'>
        <p className="mt-2 font-semibold text-brand-500">
          Rp {minPrice.toLocaleString('id-ID')}
        </p>
        <button className="linear rounded-[20px] bg-brand-900 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-800 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90">
          Sewa
        </button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;

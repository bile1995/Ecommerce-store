import { Link } from 'react-router-dom';
import { formatCurrencyFromUsd } from '../../utils/currency';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
      <Link to={`/products/${product._id}`} className="no-underline text-inherit flex flex-col h-full">
        <div className="relative w-full h-64 overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {product.featured && (
            <span className="absolute top-2 right-2 bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
              Featured
            </span>
          )}
          {product.countInStock === 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Out of Stock
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col gap-2 flex-1">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 m-0">
            {product.name}
          </h3>
          <p className="text-gray-500 text-sm m-0">{product.brand}</p>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-yellow-400">{'⭐'.repeat(Math.round(product.rating))}</span>
            <span className="text-gray-500">
              {product.rating} ({product.numReviews} reviews)
            </span>
          </div>

          <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-200">
            <span className="text-2xl font-bold text-primary-500">
              {formatCurrencyFromUsd(product.price)}
            </span>
            <span className="text-sm text-green-600 font-medium">
              {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;

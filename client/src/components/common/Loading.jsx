const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
      <p className="text-gray-500 text-lg">{message}</p>
    </div>
  );
};

export default Loading;

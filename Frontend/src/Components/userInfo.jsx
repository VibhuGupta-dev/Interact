import { useSelector } from "react-redux";

export function UserInfo() {
  const users = useSelector((store) => store.User.users);

  return (
    <div className="flex flex-wrap gap-3 p-1">
      {users.map((user, indx) => (
        <div
          key={indx}
          className="w-[130px] bg-[#242424] rounded-2xl p-4 flex flex-col items-center gap-2.5 border border-white/8"
        >
          <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-2xl font-bold text-white uppercase flex-shrink-0">
            {user.name[0]}
          </div>
          <p className="text-xs font-semibold text-[#e8e8e8] text-center truncate w-full">
            {user.name}
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">
            {user.role}
          </p>
        </div>
      ))}
    </div>
  );
}
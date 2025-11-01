import AdminUserCard from "../AdminUserCard";

export default function AdminUserCardExample() {
  const user = {
    id: 1,
    username: "alice",
    publicKey: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    isAdmin: false,
    disabled: false,
  };
  
  return (
    <div className="p-8 max-w-sm">
      <AdminUserCard 
        user={user}
        onToggleDisable={(id) => console.log("Toggle disable:", id)}
      />
    </div>
  );
}

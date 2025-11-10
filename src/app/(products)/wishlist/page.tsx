import WishlistView from "@/components/common/WishlistView";

export default function Page() {
  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6">
      <WishlistView tableName="dishes" />
    </main>
  );
}

import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(session.user.id),
    },
    include: {
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div>
            <p className="profile-label">ACCOUNT</p>
            <h1>Profili im</h1>
            <p className="profile-description">
              Menaxhoni informacionet tuaja personale dhe detajet e llogarisë
            </p>
          </div>
        </div>

        <ProfileForm
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            bio: user.bio,
            image: user.image,
            roleName: user.role.name,
          }}
        />
      </div>
    </main>
  );
}
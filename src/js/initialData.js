// Mock Initial Data for CoSave Dashboard
const initialData = {
  bankInfo: {
    name: "SeaBank",
    accountNumber: "901523028510",
    accountHolder: "ACHMAD GALIH WICAKSANA PUTRA"
  },
  users: [
    { id: "galih", name: "Galih", avatarClass: "avatar-galih" },
    { id: "fara", name: "Fara", avatarClass: "avatar-fara" }
  ],
  goals: [],
  transactions: []
};

if (typeof window !== 'undefined') {
  window.initialData = initialData;
}

export default initialData;

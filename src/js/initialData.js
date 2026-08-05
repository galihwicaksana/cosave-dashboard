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
  goals: [
    {
      id: "goal-1",
      title: "Dana Nikah",
      targetAmount: 50000000,
      currentAmount: 0,
      icon: "💍",
      color: "#FD79A8"
    },
    {
      id: "goal-2",
      title: "Liburan",
      targetAmount: 10000000,
      currentAmount: 0,
      icon: "✈️",
      color: "#6C5CE7"
    },
    {
      id: "goal-3",
      title: "Emergency Fund",
      targetAmount: 15000000,
      currentAmount: 0,
      icon: "🛡️",
      color: "#00B894"
    }
  ],
  transactions: []
};

if (!localStorage.getItem('cosave_data')) {
  localStorage.setItem('cosave_data', JSON.stringify(initialData));
}

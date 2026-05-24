const customers = [
    ["Maria Souza", "maria@exemplo.com"],
    ["João Lima", "joao@exemplo.com"],
    ["Ana Paula", "ana@exemplo.com"],
    ["Carlos Silva", "carlos@exemplo.com"],
    ["Bruna Costa", "bruna@exemplo.com"],
    ["Pedro Santos", "pedro@exemplo.com"],
    ["Fernanda Oliveira", "fernanda@exemplo.com"],
    ["Ricardo Alves", "ricardo@exemplo.com"],
    ["Juliana Pereira", "juliana@exemplo.com"],
    ["Marcos Rodrigues", "marcos@exemplo.com"],
];
function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
}
export const MOCK_ORDERS = Array.from({ length: 42 }).map((_, i) => {
    const [customer, email] = customers[i % customers.length];
    const category = ["SaaS", "Serviços", "Hardware"][i % 3];
    const status = ["paid", "pending", "canceled"][Math.floor(Math.random() * 3)];
    const amount = Math.floor(Math.random() * 5000) + 100;
    return {
        id: `PED-${String(i + 1).padStart(4, "0")}`,
        date: daysAgo(Math.floor(Math.random() * 90)),
        customer,
        email,
        category,
        status,
        amount,
    };
});

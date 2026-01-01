import React, { useState, useEffect } from 'react';
import { Pill, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Table, Button, Card, Modal, Input } from '../../components/ui';
import { apotekerService } from '../../services';
import type { Obat } from '../../types';

export const ObatApoteker: React.FC = () => {
    const [obatList, setObatList] = useState<Obat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedObat, setSelectedObat] = useState<Partial<Obat> | null>(null);

    useEffect(() => {
        loadData();
    }, [searchTerm]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await apotekerService.getObat({ search: searchTerm });
            // getObat returns array directly
            setObatList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load obat:', error);
            setObatList([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const data = Object.fromEntries(formData.entries());
            if (selectedObat?.id) {
                await apotekerService.updateObat(selectedObat.id, data);
            } else {
                await apotekerService.createObat(data);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            alert('Gagal menyimpan data obat');
        }
    };

    const columns = [
        { key: 'nama', header: 'Nama Obat', render: (it: Obat) => it.nama },
        { key: 'kategori', header: 'Kategori', render: (it: Obat) => it.kategori_display || it.kategori },
        {
            key: 'stok', header: 'Stok', render: (it: Obat) => (
                <span className={`font-bold ${it.status_stok === 'menipis' || it.status_stok === 'habis' ? 'text-red-600' : 'text-slate-800'}`}>
                    {it.stok} {it.satuan_display || it.satuan}
                </span>
            )
        },
        { key: 'harga', header: 'Harga Jual', render: (it: Obat) => `Rp ${it.harga_jual.toLocaleString('id-ID')}` },
        {
            key: 'aksi',
            header: 'Aksi',
            render: (it: Obat) => (
                <div className="flex gap-2">
                    <button onClick={() => { setSelectedObat(it); setIsModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm('Hapus obat ini?')) apotekerService.deleteObat(it.id).then(loadData); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manajemen Stok Obat</h1>
                    <p className="text-slate-500 mt-1">Kelola data obat dan ketersediaan stok</p>
                </div>
                <Button onClick={() => { setSelectedObat(null); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Obat
                </Button>
            </div>

            <Card>
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Cari nama atau kategori obat..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <Table columns={columns} data={obatList} isLoading={isLoading} />
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedObat?.id ? 'Edit Obat' : 'Tambah Obat'} size="lg">
                <form onSubmit={handleSave} className="space-y-4">
                    <Input label="Nama Obat" name="nama" defaultValue={selectedObat?.nama} required />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                            <select 
                                name="kategori" 
                                defaultValue={selectedObat?.kategori || 'tablet'}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                required
                            >
                                <option value="tablet">Tablet</option>
                                <option value="kapsul">Kapsul</option>
                                <option value="sirup">Sirup</option>
                                <option value="salep">Salep</option>
                                <option value="injeksi">Injeksi</option>
                                <option value="lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Satuan</label>
                            <select 
                                name="satuan" 
                                defaultValue={selectedObat?.satuan || 'strip'}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                required
                            >
                                <option value="strip">Strip</option>
                                <option value="botol">Botol</option>
                                <option value="tube">Tube</option>
                                <option value="ampul">Ampul</option>
                                <option value="box">Box</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Harga Beli" name="harga_beli" type="number" defaultValue={selectedObat?.harga_beli} required />
                        <Input label="Harga Jual" name="harga_jual" type="number" defaultValue={selectedObat?.harga_jual} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Stok Saat Ini" name="stok" type="number" defaultValue={selectedObat?.stok} required />
                        <Input label="Tanggal Kadaluarsa" name="expired_date" type="date" defaultValue={selectedObat?.expired_date} />
                    </div>
                    <Input label="Supplier" name="supplier" defaultValue={selectedObat?.supplier} placeholder="Nama supplier (opsional)" />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
                        <Button type="submit">Simpan Data</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

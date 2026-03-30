import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "../../../components/layout/AdminLayout";
import { brandService, categoryService } from "../../../services";
import { message, Modal, Form, Input, Button, Table, Upload, Tabs } from "antd";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { confirmCrud } from "../../../utils/confirmCrud";
import "../dashboard/index.css";

function unwrap(res) {
  return res?.result ?? res?.data ?? res;
}

function BrandsPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [logoFile, setLogoFile] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await brandService.list();
      const data = unwrap(res);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error(e?.message || "Could not load brands.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setLogoFile(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (row) => {
    const id = row.brandId ?? row.id;
    setEditingId(id);
    setLogoFile(null);
    form.setFieldsValue({
      brandName: row.brandName ?? row.name ?? "",
      brandOriginCountry: row.brandOriginCountry ?? row.originCountry ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        brandName: values.brandName?.trim(),
        brandOriginCountry: values.brandOriginCountry?.trim() || undefined,
        brandLogo: logoFile || undefined,
      };
      if (editingId != null) {
        await brandService.update(editingId, payload);
        message.success("Brand updated.");
      } else {
        await brandService.create(payload);
        message.success("Brand created.");
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || "Save failed.");
    }
  };

  const handleDelete = async (row) => {
    const id = row.brandId ?? row.id;
    if (id == null) return;
    const ok = await confirmCrud({
      title: "Delete brand?",
      content: "Listings that use this brand may be affected.",
      okText: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await brandService.remove(id);
      message.success("Deleted.");
      await load();
    } catch (e) {
      message.error(e?.message || "Delete failed.");
    }
  };

  const columns = [
    {
      title: "ID",
      width: 80,
      render: (_, r) => r.brandId ?? r.id ?? "—",
    },
    {
      title: "Name",
      render: (_, r) => r.brandName ?? r.name ?? "—",
    },
    {
      title: "Origin",
      render: (_, r) => r.brandOriginCountry ?? r.originCountry ?? "—",
    },
    {
      title: "Actions",
      width: 180,
      render: (_, r) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="link"
            size="small"
            icon={<Pencil size={16} />}
            onClick={() => openEdit(r)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            size="small"
            icon={<Trash2 size={16} />}
            onClick={() => handleDelete(r)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
          Manage bike brands used when creating listings.
        </p>
        <Button type="primary" icon={<Plus size={18} />} onClick={openCreate}>
          Add brand
        </Button>
      </div>
      <Table
        rowKey={(r) => r.brandId ?? r.id}
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingId != null ? "Edit brand" : "Add brand"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText="Save"
        width={480}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="brandName"
            label="Brand name"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="e.g. Giant" />
          </Form.Item>
          <Form.Item name="brandOriginCountry" label="Country (optional)">
            <Input placeholder="e.g. Taiwan" />
          </Form.Item>
          <Form.Item label="Logo">
            <Upload
              maxCount={1}
              beforeUpload={(file) => {
                setLogoFile(file);
                return false;
              }}
              onRemove={() => setLogoFile(null)}
            >
              <Button type="default">
                {logoFile ? logoFile.name : "Choose logo image"}
              </Button>
            </Upload>
            {editingId != null && (
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                Leave empty to keep the current logo.
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function CategoriesPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.list();
      const data = unwrap(res);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error(e?.message || "Could not load categories.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (row) => {
    const id = row.categoryId ?? row.id;
    setEditingId(id);
    form.setFieldsValue({
      categoryName: row.categoryName ?? row.name ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const name = values.categoryName?.trim();
      if (editingId != null) {
        await categoryService.update(editingId, { categoryName: name });
        message.success("Category updated.");
      } else {
        await categoryService.create({ categoryName: name });
        message.success("Category created.");
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || "Save failed.");
    }
  };

  const handleDelete = async (row) => {
    const id = row.categoryId ?? row.id;
    if (id == null) return;
    const ok = await confirmCrud({
      title: "Delete category?",
      content: "Listings that use this category may need updating.",
      okText: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await categoryService.remove(id);
      message.success("Deleted.");
      await load();
    } catch (e) {
      message.error(e?.message || "Delete failed.");
    }
  };

  const columns = [
    {
      title: "ID",
      width: 90,
      render: (_, r) => r.categoryId ?? r.id ?? "—",
    },
    {
      title: "Name",
      render: (_, r) => r.categoryName ?? r.name ?? "—",
    },
    {
      title: "Actions",
      width: 180,
      render: (_, r) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="link"
            size="small"
            icon={<Pencil size={16} />}
            onClick={() => openEdit(r)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            size="small"
            icon={<Trash2 size={16} />}
            onClick={() => handleDelete(r)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
          Bike types (Road, MTB, …) used when creating listings.
        </p>
        <Button type="primary" icon={<Plus size={18} />} onClick={openCreate}>
          Add category
        </Button>
      </div>
      <Table
        rowKey={(r) => r.categoryId ?? r.id}
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingId != null ? "Edit category" : "Add category"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText="Save"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="categoryName"
            label="Name"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="e.g. Road Bike" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

const TAB_KEYS = ["brands", "categories"];

export default function AdminCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const activeKey = TAB_KEYS.includes(tabFromUrl) ? tabFromUrl : "brands";

  const onTabChange = (key) => {
    setSearchParams({ tab: key });
  };

  return (
    <AdminLayout>
      <main className="admin-dashboard-page" style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 22 }}>Catalog</h1>
          <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
            Brands and bike categories in one place.
          </p>
        </div>
        <Tabs
          activeKey={activeKey}
          onChange={onTabChange}
          size="large"
          items={[
            {
              key: "brands",
              label: "Brands",
              children: <BrandsPanel />,
            },
            {
              key: "categories",
              label: "Categories",
              children: <CategoriesPanel />,
            },
          ]}
        />
      </main>
    </AdminLayout>
  );
}

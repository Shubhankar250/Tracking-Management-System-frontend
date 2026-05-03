import Modal from "../../components/common/Modal";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import Datatable from "../../components/common/DatatableNew";
import type { Column } from "../../components/common/DatatableNew";
import {
  uploadCommandExcel,
  clearPreview,
} from "../../slices/commandSlice";
import { toast } from "react-toastify";

const PreviewExcelModal = ({ file, onClose, onSuccess }: any) => {
  const dispatch = useAppDispatch();
  const { previewData } = useAppSelector((s) => s.commands);

  const handleSave = async () => {
    try {
      await dispatch(uploadCommandExcel(file)).unwrap();
      toast.success("Data uploaded successfully");
      dispatch(clearPreview());
      onSuccess();
      onClose();
    } catch {
      toast.error("Upload failed");
    }
  };

  const columns: Column<any>[] = [
    { key: "model", label: "MODEL" },
    { key: "commandName", label: "COMMAND NAME" },
    { key: "commandCode", label: "COMMAND CODE" },
    {
      key: "commandStatus",
      label: "COMMAND STATUS",
      render: (row) => (row.commandStatus === 1 ? "Active" : "Inactive"),
    },
    { key: "types", label: "TYPES" },
  ];


  return (
    <Modal isOpen title="Preview Commands" onClose={onClose} size="large">
      <div className="cmd-modal-body-flex">
        {/* TABLE */}
        <div className="cmd-modal-content-scroll">
          <Datatable
          columns={columns}
          data={previewData}
          totalRecords={previewData.length}
          page={1}
          pageSize={previewData.length}
          search=""
          onPageChange={() => { }}
          onSearchChange={() => { }}
          onPageSizeChange={() => { }}
          onFetch={() => { }}
        />
        </div>
        {/* FOOTER */}
        <div className="cmd-modal-footer-custom">
          <button className="btn-gray" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-blue" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
      {/* <div className="add-modal-body">
        <Datatable
          columns={columns}
          data={previewData}
          totalRecords={previewData.length}
          page={1}
          pageSize={previewData.length}
          search=""
          onPageChange={() => { }}
          onSearchChange={() => { }}
          onPageSizeChange={() => { }}
          onFetch={() => { }}
        />

        <div className="add-modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div> */}
    </Modal>
  );
};

export default PreviewExcelModal;

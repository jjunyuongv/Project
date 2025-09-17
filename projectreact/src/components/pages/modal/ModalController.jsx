import "../Facilities/css/MainContentStyle.css";
import AttendanceEdit from "./AttendanceEdit";
import "./css/ModalStyle.css";
import EmpModal from "./EmpModal";
import FacilityReservationList from "./FacilityReservationList";
import FacilityReservationWrite from "./FacilityReservationWrite";


function ModalController(props) {
  const modalName = {
    "NONE" : null,
    "FRWRITE" : <FacilityReservationWrite openModal={props.openModal} closeModal={props.closeModal} isOpen={props.isOpen} baseUrl={props.baseUrl} parentData={props.parentData} />,
    "FRLIST" : <FacilityReservationList openModal={props.openModal} closeModal={props.closeModal} isOpen={props.isOpen} baseUrl={props.baseUrl} parentData={props.parentData} />,
    "EMP" : <EmpModal openModal={props.openModal} closeModal={props.closeModal} isOpen={props.isOpen} selectData={props.selectData} baseUrl={props.baseUrl} />,
    "ATTEDIT" : <AttendanceEdit openModal={props.openModal} closeModal={props.closeModal} isOpen={props.isOpen} selectData={props.selectData} baseUrl={props.baseUrl} parentData={props.parentData} />,
  }

  return (<>
    {modalName[props.modalName]}
  </>
  );
}

export default ModalController;
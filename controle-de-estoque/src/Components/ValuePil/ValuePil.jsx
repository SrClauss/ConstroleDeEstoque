
import './ValuePil.css'
export default function ValuePil({ label, value }) {

    return (
        <div className="value-pil" >

            <div className="label">{label}</div>
            <div className="value">{value}</div>
        </div>
    )
}




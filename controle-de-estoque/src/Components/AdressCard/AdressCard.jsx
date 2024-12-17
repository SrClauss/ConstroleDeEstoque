import "./AdressCard.css";
import { Button } from "@mui/material"
import { IconButton } from "@mui/material"
import { Delete } from "@mui/icons-material"

export default function AdressCard({ adresses, onAddAdress, onDeleteAdress }) {

    return (
        <div className="adress-card">
            <div>
                <Button onClick={onAddAdress}>Adicionar Endereço</Button>
            </div>
           {
                adresses.map((adress, index) => {
                    return (
                        <div className="adress" key={index}>
                    
                                <IconButton
                                    className="delete-button"
                                    onClick={() => onDeleteAdress(index)}

                                >
                                    <Delete color="error" />
                                </IconButton>

            


                            <div className="div-adress">
                                <div className="div-info">{adress.nome_endereco}</div>
                                <div className="div-info">{adress.logradouro}, {adress.numero ? adress.numero : 'SN'}, {adress.bairro} {adress.complemento ? `, ${adress.complemento}` : ''}
                                {adress.referencia ? ` - ${adress.referencia}` : ''}
                                </div>
                            </div>
                            <div className="div-cep">
                                {adress.cep} - {adress.cidade} - {adress.estado}
                            </div>
                            <div className="divider"></div>
                        </div>
                    )
                })
            }
        </div>
    );
}
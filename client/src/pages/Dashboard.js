import { useCallback, useEffect, useState } from "react";
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import {Table,Button,Form,Input,Modal} from 'antd';
import Parameter from '../components/Parameter';
import {AiOutlineFundView ,AiFillPlusCircle} from 'react-icons/ai';
import {toast, Flip } from 'react-toastify';
const config=require('../config/config');

function Dashboard(props){
    const {profile, logOutFunc}=props;
    const [dataAvailable,setDataAvailable]=useState(false);
    const [dashboardData,setDashboardData]=useState([]);
    const [strategyModal,setStrategyModal]=useState(false);
    const [confirmLoading,setConfirmLoading]=useState(false);
    const [strategyData,setStrategyData]=useState([]);
    const [addParam,setAddParam]=useState(true);
    const [paramDesc,setParamDesc]=useState("");
    const [strategyError,setStrategyError]=useState(false);

    const lengthAttr=["i_supertrend","i_bbUpper","i_atr","i_ema"];
    const factorAttr=["i_supertrend","i_bbUpper"];
    const navigate = useNavigate();
    const screenWidth = window.innerWidth;

    const validateStrategyData=()=>{
        if(strategyData.length===0) return false;
        let valid=true;
        strategyData.forEach(param=>{
            if(param.ind1===undefined || param.ind2===undefined) valid=false;
            if((lengthAttr.includes(param.ind1) || param.ind1==='i_emaCross') && param.l1===undefined) valid=false;
            if((lengthAttr.includes(param.ind2) || param.ind2==='i_emaCross') && param.l2===undefined) valid=false;
            if((factorAttr.includes(param.ind1) || param.ind1==='i_emaCross') && param.f1===undefined) valid=false;
            if((factorAttr.includes(param.ind2) || param.ind2==='i_emaCross') && param.f2===undefined) valid=false;
            if(param.comp===undefined || param.days===undefined) valid=false;
        })
        return valid;
    }

    const columns = [
        {
            title: 'Strategy',
            dataIndex: 'description',
            width:400,
            key:'strategy',
            render:(_,{description,id})=>(
                <>
                <span style={{marginRight:'20px'}}>{description}</span>
                <a href={`/strategy?id=${id}`}><AiOutlineFundView style={{position:'relative',top:'8px'}} size={25}/></a>
                </>
              )
        },
        {
          title: 'Added on',
          dataIndex: 'date',
          key:'date',
          defaultSortOrder: 'descend',
          width:screenWidth>=768?400:150,
          sorter: (a, b) => a.id - b.id,
        }
      ];

    function onStrategyChange(index, data){
        let tempStrategyData=strategyData;
        tempStrategyData[index]=data;
        setStrategyData(tempStrategyData);
    }

    function onStrategyParameterAdd(){
        setStrategyData([...strategyData,null]);
    }

    function onStrategyParameterRemove(index){
        let tempStrategyData=strategyData;
        tempStrategyData.splice(index, 1);
        setStrategyData(tempStrategyData);
    }

     const onFinish = (values) => {
      };

    function compileStrategyData(){
        let tempStrategyData=strategyData;
        let paramString="";
        tempStrategyData.map(param=>{
            if(!param) return '';
            return (''+param.ind1+
                (param.hasOwnProperty('l1')?'#'+param.l1:'')+
                (param.hasOwnProperty('f1')?'#'+param.f1:'')+
                '#'+param.days+param.comp+
                param.ind2+
                (param.hasOwnProperty('l2')?'#'+param.l2:'')+
                (param.hasOwnProperty('f2')?'#'+param.f2:'')+
                '#'+param.days+',');
        }).forEach(res=>{
            paramString+=res
        });

        return paramString;
    }

    const handleOk = () => {
        if(!validateStrategyData()){
            setStrategyError(true);
            return;
        }
        else{
            setStrategyError(false);
        }
        setConfirmLoading(true);
        let paramString=compileStrategyData();
        let dateToday=new Date();
        let strategy={
            username:profile.given_name,
            description: paramDesc,
            date: ''+dateToday.getDate()+'-'+dateToday.getMonth()+'-'+dateToday.getFullYear(),
            parameter: paramString,
            googleid:profile.id,
            email:profile.email
        };
        const authToken=localStorage.getItem('git');
        axios.post(config.API_PREFIX+'/storestrategy',strategy,{
            headers:{
                Authorization: `Bearer ${authToken}`,
                "Content-Type":'application/json'
            }
        })
        .then(response=>{
            setTimeout(() => {
                setStrategyModal(false);
                setConfirmLoading(false);
              }, 1000);
              toast.success(`Saved strategy '${paramDesc}'`, {
                  position: "bottom-right",
                  autoClose: 1500,
                  hideProgressBar: false,
                  closeOnClick: true,
                  theme: "light",
                  transition: Flip,
                  });
        })
        .catch(err=>{
            if(err.response && (err.response.status===401 || err.response.status===403) ){
                toast.error(`Unauthorized, please login again`, {
                    position: "bottom-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    theme: "light",
                    transition: Flip,
                    });
                setTimeout(() => {
                    logOutFunc();
                }, 2000);
            }
            else{
                navigate("/maintainence");
            }
        })
      };

    const getStrategyList=useCallback(()=>{
        const authToken = localStorage.getItem('git');
        axios.get(config.API_PREFIX+`/dashboard?googleid=${profile.id}`,{
            headers:{
                Authorization: `Bearer ${authToken}`,
                "Content-Type":'application/json'
            }
        })
        .then(response=>{
            setDashboardData(response.data.data.map((obj,index)=>({...obj, key:index})));
            setDataAvailable(true);
        })
        .catch(err=>{
            if(err.response && (err.response.status===401 || err.response.status===403) ){
                toast.error(`Unauthorized, please login again`, {
                    position: "bottom-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    theme: "light",
                    transition: Flip,
                    });
                setTimeout(() => {
                    logOutFunc();
                }, 2000);
            }
            else{
                navigate("/maintainence");
            }
        })
    },[profile,navigate,logOutFunc]);

    function addStrategy(){
        setStrategyModal(true);
    }

    function handleCancel(){
        setStrategyModal(false);
    }

    useEffect(()=>{
        getStrategyList();
    },[strategyModal,profile,getStrategyList]);

    return(
        <div>
            <br/>
            <div style={{height:'90vh'}}>
                <br/><br/>
                <Button type="primary" icon={<AiFillPlusCircle />} size={20} onClick={addStrategy}>
                    Add Strategy
                </Button>
                <br/><br/>
                {dataAvailable && dashboardData.length===0 && <div className="placeholder">
                    Start by adding a strategy!
                </div>}
                {dataAvailable && dashboardData.length>0 && <Table columns={columns} dataSource={dashboardData} className="dashboard-table" pagination={false}/>}
            </div>
            <Modal
                title="New Strategy"
                open={strategyModal}
                onOk={handleOk}
                okText="Save Strategy"
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                width={1000}
            >
                <Input placeholder="Description" style={screenWidth>=768?{width:'80%'}:{width:'80%'}} onChange={(e)=>{setParamDesc(e.target.value);}}/>
                <br/><br/>
                <Form
                    name="parameter_form"
                    onFinish={onFinish}
                >
                <Parameter index={0} onModify={onStrategyChange}/>
                <Form.List
                    name="Parameter"
                    rules={[
                    {
                        validator: async (_, paramters) => {
                        if (!paramters) {
                            return Promise.reject(new Error('Add atleast one parameter'));
                        }
                        if (paramters.length===2) {
                            setAddParam(false);
                            return Promise.reject(new Error('Maximum 3 parameters can be added'));
                        }
                        },
                    },
                    ]}
                >
                    {(fields, { add, remove }, { errors }) => (
                        <>
                            {fields.map((field, index) => (
                            <Form.Item
                                required={false}
                                key={field.key}
                            >
                                <Parameter field={field} index={index} onModify={onStrategyChange} onRemove={()=>{onStrategyParameterRemove(index);remove(field.name);setAddParam(true);}}/>
                            </Form.Item>
                            ))}
                            <Form.Item>
                            {addParam && <AiFillPlusCircle onClick={() => {onStrategyParameterAdd();add();}} size={40} style={{cursor:'pointer',color:'#1677ff'}}/>}
                            <Form.ErrorList errors={errors} />
                            </Form.Item>
                        </>
                    )}
                </Form.List>
                </Form>
                {
                    strategyError && <div style={{color:'red'}}>Please populate all the fields</div>
                }
            </Modal>
        </div>
    );
}

export default Dashboard;
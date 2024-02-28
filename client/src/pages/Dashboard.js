import { useCallback, useEffect, useState } from "react";
import axios from 'axios';
import {Link} from 'react-router-dom';
import {Table,Button,Form,Input,Modal} from 'antd';
import Parameter from '../components/Parameter';
import {AiOutlineContainer,AiOutlinePlus} from 'react-icons/ai';
const config=require('../config/config');

function Dashboard(props){
    const {profile}=props;
    const [dataAvailable,setDataAvailable]=useState(false);
    const [dashboardData,setDashboardData]=useState([]);
    const [strategyModal,setStrategyModal]=useState(false);
    const [confirmLoading,setConfirmLoading]=useState(false);
    const [strategyData,setStrategyData]=useState([]);
    const [addParam,setAddParam]=useState(true);
    const [paramDesc,setParamDesc]=useState("");

    const columns = [
        {
            title: 'Strategy',
            dataIndex: 'description',
            width:400,
            render:(_,{description,id})=>(
                <>
                <span style={{marginRight:'20px'}}>{description}</span>
                <Link style={{textDecoration:'none'}} to={`/strategy?id=${id}`}>
                    <AiOutlineContainer style={{marginTop:'5px'}} size={15}/>
                </Link>
                </>
              )
        },
        {
          title: 'Date added',
          dataIndex: 'date',
          defaultSortOrder: 'descend',
          width:400,
          sorter: (a, b) => a.id - b.id,
        }
      ];

    function onStrategyChange(index, data){
        console.log("changing index ",index);
        let tempStrategyData=strategyData;
        tempStrategyData[index]=data;
        setStrategyData(tempStrategyData);
        console.log("strat data: ",strategyData);
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
        console.log('Received values of form:', values);
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
        setConfirmLoading(true);
        let paramString=compileStrategyData();
        let dateToday=new Date();
        console.log("date: ",dateToday);
        let strategy={
            username:profile.given_name,
            description: paramDesc,
            date: ''+dateToday.getDate()+'-'+dateToday.getMonth()+'-'+dateToday.getFullYear(),
            parameter: paramString,
            googleid:profile.id,
            email:profile.email
        };
        axios.post(config.API_PREFIX+'/storestrategy',strategy)
        .then(response=>{
            console.log("response: ",response);
        })
        .catch(err=>{
            console.log("err: ",err);
        })
        console.log("strategy: ",strategy);
        setTimeout(() => {
          setStrategyModal(false);
          setConfirmLoading(false);
        }, 1000);
      };

    const getStrategyList=useCallback(()=>{
        axios.get(config.API_PREFIX+`/dashboard?googleid=${profile.id}`)
        .then(response=>{
            console.log("reponse: ",response.data.data);
            setDashboardData(response.data.data);
            setDataAvailable(true);
        })
        .catch(err=>{
            console.log("err: ",err);
        })
    },[profile]);

    function addStrategy(){
        setStrategyModal(true);
    }

    function handleCancel(){
        setStrategyModal(false);
    }

    useEffect(()=>{
        console.log("calling list");
        getStrategyList();
    },[strategyModal,profile,getStrategyList]);

    return(
        <div>
            <br/>
            <div className="">
                <br/><br/>
                <Button type="primary" icon={<AiOutlinePlus />} size={20} onClick={addStrategy}>
                    Add Strategy
                </Button>
                <br/><br/>
                {dataAvailable && dashboardData.length===0 && <div className="placeholder">
                    Start by adding a strategy!
                </div>}
                {dataAvailable && dashboardData.length>0 && <Table columns={columns} dataSource={dashboardData} style={{margin:'auto',maxWidth:'65%'}} pagination={false}/>}
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
                <Input placeholder="Description" onChange={(e)=>{setParamDesc(e.target.value);}}/>
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
                            {addParam && <Button
                                type="primary"
                                shape="circle"
                                onClick={() => {onStrategyParameterAdd();add();}}
                                icon={<AiOutlinePlus />}
                                size="large"
                            >
                            </Button>}
                            <Form.ErrorList errors={errors} />
                            </Form.Item>
                        </>
                    )}
                </Form.List>
                </Form>
            </Modal>
        </div>
    );
}

export default Dashboard;
import {Button,Input,InputNumber,Form,Select,Space} from 'antd';
import { useState } from 'react';

export default function Parameter({field, index, onModify, onRemove}){
    const [selectedIndicator,setSelectedIndicator] = useState("");
    const [secondIndicator,setSecondIndicator] = useState("");
    const [paramData,setParamData]=useState({});
    let indexOffset=0;
    const lengthAttr=["i_supertrend","i_bbUpper","i_atr","i_ema"];
    const factorAttr=["i_supertrend","i_bbUpper"];

    if(field){
        indexOffset=1;
    }

    const onIndicatorChange=(e)=>{
        let tempData=paramData;
        tempData["ind1"]=e;
        if(!lengthAttr.includes(e)) onl1Change(null);
        if(!factorAttr.includes(e)) onf1Change(null);
        setParamData(tempData);
        onModify(index+indexOffset,paramData);
        setSelectedIndicator(e);
    }

    const onSecondIndicatorChange=(e)=>{
        let tempData=paramData;
        tempData["ind2"]=e;
        if(!lengthAttr.includes(e)) onl2Change(null);
        if(!factorAttr.includes(e)) onf2Change(null);
        setParamData(tempData);
        onModify(index+indexOffset,paramData);
        setSecondIndicator(e);
    }

    const onCompChange=(e)=>{
        let tempData=paramData;
        tempData["comp"]=e;
        setParamData(tempData);
        onModify(index+indexOffset,paramData);
    }

    const onl1Change=(e)=>{
        let tempData=paramData;
        if(!e){
            delete tempData.l1;
        }
        else{
            tempData["l1"]=e;
        } 
        setParamData(tempData);
        onModify(index+indexOffset,paramData);
    }
    
    const onf1Change=(e)=>{
        let tempData=paramData;
        if(!e){
            delete tempData.f1;
        }
        else{
            tempData["f1"]=e;
        } 
        setParamData(tempData);
        onModify(index+indexOffset,paramData);
    }

    const onl2Change=(e)=>{
        let tempData=paramData;
        if(!e){
            delete tempData.l2;
        }
        else{
            tempData["l2"]=e;
        } 
        setParamData(tempData);
        onModify(index+indexOffset,paramData);
    }
    
    const onf2Change=(e)=>{
        let tempData=paramData;
        if(!e){
            delete tempData.f2;
        }
        else{
            tempData["f2"]=e;
        } 
        setParamData(tempData);
        onModify(index+indexOffset,paramData);
    }

    const onDaysChange=(e)=>{
        console.log("days: ",e)
        if(!e) return;
        let tempData=paramData;
        tempData["days"]=e;
        setParamData(tempData);
        onModify(index+indexOffset,paramData);
    }

    return (
        <div className='indicator-section'>
        {
        onRemove && <Button onClick={onRemove} style={{position:'absolute',left:'83%'}}>Remove Parameter</Button>
        }
        <Space>
            <Form.Item
                {...field}
                validateTrigger={['onIndicatorChange', 'onBlur']}
                rules={[
                    {
                    required: true,
                    whitespace: true,
                    message: "Please select an indicator",
                    },
                ]}
                style={selectedIndicator===""?{minWidth:'150px'}:{}}
            >
            <Select placeholder="Indicator" onChange={onIndicatorChange}>
                <Select.Option value="i_supertrend">Supertrend</Select.Option>
                <Select.Option value="i_ema">Exponential Moving Average (EMA)</Select.Option>
                <Select.Option value="i_atr">Average True Range (ATR)</Select.Option>
                <Select.Option value="i_bbUpper">Upper Bollinger Band</Select.Option>
                <Select.Option value="i_close">Close Price</Select.Option>
                <Select.Option value="i_emaCross">EMA Cross</Select.Option>
            </Select>
            </Form.Item>
            {lengthAttr.includes(selectedIndicator) && <Form.Item rules={[{required: true}]}>
                <InputNumber min={0} placeholder="Length" onChange={onl1Change}/>
            </Form.Item>}
            {factorAttr.includes(selectedIndicator) && <Form.Item rules={[{required: true}]}>
                <InputNumber min={0} placeholder="Factor" onChange={onf1Change}/>
            </Form.Item>}
            {
                selectedIndicator==="i_emaCross" && <Form.Item rules={[{required: true}]}>
                    <InputNumber min={0} placeholder="Short" onChange={onl1Change}/>
                </Form.Item>
            }
            {
                selectedIndicator==="i_emaCross" && <Form.Item rules={[{required: true}]}>
                    <InputNumber min={0} placeholder="Long" onChange={onf1Change}/>
                </Form.Item>
            }
            
        </Space>
        <br/>
        <Space>
        <Form.Item
            validateTrigger={['onChange', 'onBlur']}
            rules={[
                {
                required: true,
                whitespace: true,
                message: "Please select a comparator",
                },
            ]}   
            style={{minWidth:'150px'}}
        >
        <Select placeholder="is" onChange={onCompChange}>
          <Select.Option value="<" disabled={selectedIndicator==='i_emaCross' || selectedIndicator==='i_supertrend'}>is Less than</Select.Option>
          <Select.Option value=">" disabled={selectedIndicator==='i_emaCross' || selectedIndicator==='i_supertrend'}>is Greater than</Select.Option>
          <Select.Option value="=">is Equal to</Select.Option>
        </Select>
        </Form.Item>
        </Space>
        <br/>
        <Space>
            <Form.Item
                validateTrigger={['onIndicatorChange', 'onBlur']}
                rules={[
                    {
                    required: true,
                    whitespace: true,
                    message: "Please select an indicator",
                    },
                ]}
                style={secondIndicator===""?{minWidth:'150px'}:{}}
            >
            {selectedIndicator==='i_supertrend' && <Select placeholder="Indicator" onChange={onSecondIndicatorChange}>
                <Select.Option value="green">Green</Select.Option>
                <Select.Option value="red">Red</Select.Option>
            </Select>}
            {selectedIndicator==='i_emaCross' && <Select placeholder="Indicator" onChange={onSecondIndicatorChange}>
                <Select.Option value="up">Up</Select.Option>
                <Select.Option value="down">Down</Select.Option>
            </Select>}
            {selectedIndicator!=='i_supertrend' && selectedIndicator!=='i_emaCross' && <Select placeholder="Indicator" onChange={onSecondIndicatorChange}>
                <Select.Option value="i_supertrend">Supertrend</Select.Option>
                <Select.Option value="i_ema">Exponential Moving Average (EMA)</Select.Option>
                <Select.Option value="i_atr">Average True Range (ATR)</Select.Option>
                <Select.Option value="i_bbUpper">Upper Bollinger Band</Select.Option>
                <Select.Option value="i_close">Close Price</Select.Option>
                <Select.Option value="i_emaCross">EMA Cross</Select.Option>
            </Select>}
            </Form.Item>
            {lengthAttr.includes(secondIndicator) && <Form.Item rules={[{required: true}]} >
                <InputNumber min={0} placeholder="Length" onChange={onl2Change}/>
            </Form.Item>}
            {factorAttr.includes(secondIndicator) && <Form.Item rules={[{required: true}]} >
                <InputNumber min={0} placeholder="Factor" onChange={onf2Change}/>
            </Form.Item>}
            {
                secondIndicator==="i_emaCross" && <Form.Item rules={[{required: true}]} >
                    <InputNumber min={0} placeholder="Short" onChange={onl2Change}/>
                </Form.Item> && <Form.Item rules={[{required: true}]} >
                    <InputNumber min={0} placeholder="Long" onChange={onf2Change}/>
                </Form.Item>
            }
        </Space>
        <br/>
        <Space>
        Since (Days)
        <Form.Item style={{margin:'auto'}}>
            <InputNumber min={1} max={20} onChange={onDaysChange} />
        </Form.Item>
        </Space>
        </div>
    );
}

/*
 * Copyright (c) 2020-2022. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

import * as React from "react";
import Voodoo     from "react-voodoo";

export default ( {
	                 children, record,
	                 voodooRef,
	                 ...props
                 } ) => {
	const
		[tweener, ViewBox] = Voodoo.hook(),
		styles             = React.useMemo(
			() => (
				{
					label  : {
						style: {
							position : "absolute",
							top      : "20%",
							left     : "5%",
							right    : "30%",
							color    : "white",
							fontSize : "4em",
							//opacity  : 0,
							transform: [{
								//translateY: "-5em"
							}]
						},
						axes : {
							entering: [
								{
									from    : 0,
									duration: 100,
									apply   : {
										//opacity  : 1,
										transform: [
											{
												//translateY: "5em"
											}
										]
									}
								},
							],
							leaving : [
								{
									from    : 0,
									duration: 100,
									apply   : {
										//opacity  : -1,
										transform: [
											{
												//translateX: "5em"
											}
										]
									}
								},
							]
						}
					},
					summary: {
						style: {
							position : "absolute",
							top      : ["20%", "3em"],
							left     : "10%",
							right    : "40%",
							color    : "white",
							fontSize : "2em",
							opacity  : 0,
							transform: [{
								translateX: "3em"
							}]
						},
						axes : {
							visible: [
								{
									from    : 0,
									duration: 100,
									apply   : {
										opacity  : 1,
										transform: [
											{
												translateX: "-3em"
											}
										]
									}
								},
							]
						}
					},
				}
			),
			[]
		);

	React.useEffect(
		() => {
			voodooRef?.(tweener);
		},
		[]
	)
	
	return <ViewBox className={'Slide '}>
		<Voodoo.Axis
			id={"visible"}
			defaultPosition={0}
		/>
		<Voodoo.Axis
			id={"entering"}
			defaultPosition={0}
		/>
		<Voodoo.Axis
			id={"leaving"}
			defaultPosition={100}
		/>
		{
			record &&
			<div className={"content"}>
				{
					record.backgroundImage &&
					<img src={record.backgroundImage} className={"ghost"} draggable={false}/>
				}
				{
					record.backgroundImage &&
					<img src={record.backgroundImage} draggable={false}/>
				}
				
				<Voodoo.Node.div className={"label"} {...styles.label}>
					{record.label}
				</Voodoo.Node.div>
				<Voodoo.Node.div className={"summary"} {...styles.summary}>
					<span dangerouslySetInnerHTML={{ __html: (record.summary || "").replace(/\n/ig, "<br/>") }}/>
				</Voodoo.Node.div>
			</div>
		}
	</ViewBox>
}

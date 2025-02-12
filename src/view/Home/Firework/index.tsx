import React, {useEffect} from 'react';
import {useStores} from '@/store';
import {observer} from 'mobx-react-lite';
import {useNavigate} from 'react-router-dom';
import './index.less';
interface Iitem {
    name: string;
    url: string;
}
const HomeTwo: React.FC<{item: Iitem}> = () => {
    const {globalStore} = useStores();
    const {getFetchGetTest} = globalStore;
    const data = [
        {name: 'firework show', url: '/canvas/firework'},
        {name: 'smog show', url: '/canvas/smog'},
        {name: 'smoke show', url: '/canvas/smoke'}
    ];
    const navigate = useNavigate();
    // 查询更多
    const handleGetMorePokemon = (item: Iitem) => () => {
        //添加跳转事件
        if (item.name === 'smoke show') {
            navigate(item.url, {
                state: {
                    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/quickText.png',
                    opacity: '1',
                    smokeSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png',
                    smokeOpacity: '0.3'
                }
            });
        } else {
            navigate(item.url);
        }
    };

    useEffect(() => {
        getFetchGetTest({
            limit: 20,
            offset: 0
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className='home-two-root'>
            <div className='search-wrap'>
            </div>

            <div className='list-root'>
                {data.map((item: Iitem) => (
                    <div key={item.name} className='pokemon-item' onClick={handleGetMorePokemon(item)}>
                        <span>{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default observer(HomeTwo);

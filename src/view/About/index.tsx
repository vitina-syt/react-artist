import React from 'react';
import {observer} from 'mobx-react-lite';
// import {runInAction} from 'mobx';
// import {GetResponsePokemonData} from '@/api/home-two/types/home-two';
import {GithubLogo} from '@phosphor-icons/react';
// import {fetchPokemon} from '@/api/home-two';
import * as styles from './index.module.less';

// interface StoreType {
//     pokemon: string;
//     getFetchPokemo: () => void;
// }
// FSM模式: 有限状态机
// 有限状态机（Finite-state machine,FSM），又称有限状态自动机，简称状态机，表示有限个状态以及在这些状态之间的转移和动作等行为的数学模型
// type DataStateType = 'LOADING' | 'SUCCESS' | 'ERROR';

const About = () => {
    // const [dataState, setDataState] = useState<DataStateType>('LOADING');
    // const PokemoStore = useLocalObservable<StoreType>(() => ({
    //     pokemon: '',
    //     async getFetchPokemo() {
    //         try {
    //             const res: GetResponsePokemonData = await fetchPokemon({
    //                 limit: 500
    //             });
    //             const {results} = res.data;
    //             if (results) {
    //                 setDataState('SUCCESS');
    //                 runInAction(() => {
    //                     this.pokemon = 'Pokemon';
    //                 });
    //             } else {
    //                 setDataState('ERROR');
    //                 runInAction(() => {
    //                     this.pokemon = 'ERROR';
    //                 });
    //             }
    //         } catch (err) {
    //             setDataState('ERROR');
    //         }
    //     }
    // }));
    // const {getFetchPokemo, pokemon} = PokemoStore;

    // useEffect(() => {
    //     getFetchPokemo();
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    return (
        <div className={styles.aboutRoot}>
            <a href='https://github.com/vitina-syt'>
                <GithubLogo size={68} color='#f9f4da' />
            </a>
            <div className={styles.header}> About Me </div>
            <p>喜欢挑战，喜欢艺术的前端开发工程师</p>
            <p>喜欢生活与工作互相制衡，不断进步</p>
            <p>拥抱新事物，快速学习新技术，挖掘爱好与工作结合新方式</p>
            {/* {dataState === 'LOADING' && <div>LOADING</div>}
            {dataState === 'SUCCESS' && <div>SUCCESS {pokemon}</div>}
            {dataState === 'ERROR' && <div>ERROR {pokemon}</div>} */}
        </div>
    );
};

export default observer(About);

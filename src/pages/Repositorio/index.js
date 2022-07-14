import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom'
import { Container, Owner, Loading, BackButton, IssuesList, PageActions, ButtonFilter } from "./styles";
import api from '../../services/api';
import { FaArrowLeft } from 'react-icons/fa';

export default function Repositorio() {
    let { repositorio } = useParams();
    const [repositorios, setRepositorios] = useState({});
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState([
        {state: 'all', label: 'Todas', active: true},
        {state: 'open', label: 'Abertas', active: false},
        {state: 'closed', label: 'Fechadas', active: false},
    ]);
    const [filterIndex, setFilterIndex] = useState(0);

    useEffect(() => {

        async function load() {


            const [repositorioData, issuesData] = await Promise.all([
                api.get(`/repos/${repositorio}`),
                api.get(`/repos/${repositorio}/issues`, {
                    params: {
                        state: filters.find(f => f.active).state,
                        per_page: 5
                    }
                })
            ]);

            setRepositorios(repositorioData.data);
            setIssues(issuesData.data);
            setLoading(false);
        }

        load();

    }, [repositorio]);

    useEffect(() => {

        async function loadIssue() {
            const response = await api.get(`/repos/${repositorio}/issues`, {
                params: {
                    state: filters[filterIndex].state,
                    page,
                    per_page: 5,
                },
            });
            console.log(response)
            setIssues(response.data);
        }

        loadIssue();

    }, [page, filterIndex, filters]);

    function handlePage(action) {
        setPage(action === 'back' ? page - 1 : page + 1)
    }

    function handleFilter(index) {
        setFilterIndex(index);
    }

    if (loading) {
        return (
            <Loading>
                <h1>Carregando...</h1>
            </Loading>
        )
    }

    return (

        <Container>
            <BackButton to="/">
                <FaArrowLeft color="#000" size={30} />
            </BackButton>

            <Owner>
                <img src={repositorios.owner.avatar_url} />
                <h1>{repositorios.name}</h1>
                <p>{repositorios.description}</p>
            </Owner>
            <ButtonFilter active={filterIndex}>
                {filters.map((filter, index) => (
                    <button
                        type="button"
                        key={filter.label}
                        onClick={()=> handleFilter(index)}
                        >
                            {filter.label}
                        </button>
                ))}
            </ButtonFilter>
            <IssuesList>
                {issues.map(issue => (
                    <li key={String(issue.id)}>
                        <img src={issue.user.avatar_url} />

                        <div>
                            <strong>
                                <a href={issue.html_url}>{issue.title}</a>

                                {issue.labels.map(label => (
                                    <span key={String(label.id)}>{label.name}</span>
                                ))}
                            </strong>
                            <p>{issue.user.login}</p>
                        </div>
                    </li>
                ))}
            </IssuesList>

            <PageActions>
                <button
                    type="button"
                    onClick={() => handlePage('back')}
                    disabled={page < 2}
                >
                    Voltar
                </button>
                <button type="button" onClick={() => handlePage('next')}>
                    Proxima
                </button>
            </PageActions>

        </Container>

    )
}